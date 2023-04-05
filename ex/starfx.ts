import { request, json, parallel, forEach } from 'starfx';

function* showChapters(chapterURLs: string[]) {
  const reqs = chapterURLs.map(function (url) {
    return function* () {
      const response = yield* request(url);
      return yield* json(response);
    };
  });

  const chapters = yield* parallel(reqs);

  yield* forEach(chapters.sequence, function* (chapter) {
    if (chapter.ok) {
      appendChapter(chapter.value);
    } else {
      console.error(chapter.error);
    }
  });
}

// Run against `npm run dev`: node tests/language.cjs (Playwright and its Chromium must be available).
// Set PLAYWRIGHT_CHANNEL=msedge to use an installed Edge browser instead.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
    await page.getByTitle('Language', { exact: true }).waitFor();
    await page.getByText('Home', { exact: true }).first().click();
    await page.getByTitle('Prompt', { exact: true }).click();
    const original = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Add button', exact: true }).waitFor();
    const resized = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.deepEqual(resized.groups, original.groups, 'Resizing must not replace canvas parts');
    assert.deepEqual(resized.frames, original.frames, 'Resizing must not replace screens');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByTitle('Parts', { exact: true }).waitFor();
    const languages = [
      { key: 'ko', name: '한국어', menu: '언어', parts: '부품', favorite: '즐겨찾기', title: '제목', prompt: '프롬프트' },
      { key: 'ja', name: '日本語', menu: '言語', parts: '部品', favorite: 'お気に入り', title: 'タイトル', prompt: 'プロンプト' },
      { key: 'zh', name: '中文', menu: '语言', parts: '组件', favorite: '收藏', title: '标题', prompt: '提示词' },
      { key: 'en', name: 'English', menu: 'Language', parts: 'Parts', favorite: 'Favorite', title: 'Title', prompt: 'Prompt' },
    ];
    let menu = 'Language';
    for (const lang of languages) {
      await page.getByTitle(menu, { exact: true }).click();
      await page.getByRole('menuitemradio', { name: lang.name }).click();
      await page.getByTitle(lang.parts, { exact: true }).waitFor();
      await page.waitForFunction((key) => document.documentElement.lang === key && JSON.parse(localStorage.getItem('m3e:ui')).lang === key, lang.key);
      const doc = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
      const items = doc.groups.flatMap((group) => group.items);
      assert.equal(items.find((item) => item.icon === 'star' && item.kind === 'button').label, lang.favorite);
      assert.equal(items.find((item) => item.kind === 'topAppBar').label, lang.title);
      assert.deepEqual(items.map((item) => item.id), original.groups.flatMap((group) => group.items.map((item) => item.id)));
      const prompt = await page.getByRole('textbox', { name: lang.prompt, exact: true }).inputValue();
      assert.ok(prompt.includes(lang.favorite), `Prompt did not update for ${lang.key}`);
      if (lang.key === 'ko') {
        assert.ok(prompt.includes('구현해 주세요'));
        const fonts = await page.evaluate(async () => {
          await document.fonts.ready;
          return [...document.fonts].filter((font) => font.family === 'Noto Sans KR' && font.status === 'loaded').length;
        });
        assert.ok(fonts > 0, 'Korean web font did not load');
        await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'm3e-korean.png') });
      }
      menu = lang.menu;
    }

    // Both history stacks must follow language changes without changing their geometry or IDs.
    await page.getByTitle('Add screen', { exact: true }).click();
    await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click();
    await page.getByTitle('Language', { exact: true }).click();
    await page.getByRole('menuitemradio', { name: '한국어' }).click();
    await page.getByTitle('다시 실행 (Ctrl+Shift+Z)', { exact: true }).click();
    const redone = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.deepEqual(redone.frames.map((frame) => frame.name), ['홈', '화면 2']);
    assert.ok(redone.groups.flatMap((group) => group.items).some((item) => item.label === '즐겨찾기'));
    await page.getByTitle('언어', { exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'English', exact: true }).click();
    const renamed = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.deepEqual(renamed.frames.map((frame) => frame.name), ['Home', 'Screen 2']);
    await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click();
    const undone = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.deepEqual(undone.groups, original.groups);
    assert.deepEqual(undone.frames, original.frames);

    // A saved project can mix defaults and authored text, including an edited prompt.
    await page.evaluate(() => {
      const doc = JSON.parse(localStorage.getItem('m3e:doc'));
      doc.groups.flatMap((group) => group.items).find((item) => item.kind === 'button').label = 'My custom button';
      doc.promptEdit = 'My custom prompt';
      doc.frames[0].name = 'My custom screen';
      localStorage.setItem('m3e:doc', JSON.stringify(doc));
    });
    await page.reload();
    await page.getByTitle('Language', { exact: true }).click();
    await page.getByRole('menuitemradio', { name: '한국어' }).click();
    await page.getByTitle('부품', { exact: true }).waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.ok(saved.groups.flatMap((group) => group.items).some((item) => item.label === 'My custom button'));
    assert.equal(saved.promptEdit, 'My custom prompt');
    assert.equal(saved.frames[0].name, 'My custom screen');
    await page.reload();
    await page.getByTitle('언어', { exact: true }).waitFor();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'en-US' });
    await mobile.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
    await mobile.getByTitle('Language', { exact: true }).click();
    await mobile.getByRole('button', { name: '한국어', exact: true }).click();
    await mobile.getByTitle('언어', { exact: true }).waitFor();
    const mobileDoc = await mobile.evaluate(() => JSON.parse(localStorage.getItem('m3e:doc')));
    assert.deepEqual(mobileDoc.groups.flatMap((group) => group.items.map((item) => item.label)), ['즐겨찾기', '공유', '시작하기']);
    assert.deepEqual(errors, []);
    console.log('PASS: four-language switching, generated prompt, Korean font, authored text, persistence, and mobile');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

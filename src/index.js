import { promises as fs } from "fs";
import Parser from "rss-parser";

const parser = new Parser();

const getLatestArticlesFromBlog = () =>
  parser.parseURL("https://www.blog.everstarck.com/index.xml").then((data) => data.items);

(async () => {
  const [template, articles] = await Promise.all([
    fs.readFile("./src/README.md.tpl", { encoding: "utf-8" }),
    getLatestArticlesFromBlog()
  ]);

  // create latest articles markdown
  const latestArticlesMarkdown = articles
    .slice(0, 3)
    .map(article => {
      const {title, link} = article
      let img = article.content.match('src="(.*)" alt') == null ? 'https://user-images.githubusercontent.com/51029456/122140420-d7c8ed00-ce10-11eb-8bdc-bf50df6070a2.png' : article.content.match('src="(.*)" alt')[1]

      let articleHtml = `
<div style="margin: 0 0 20px 0; width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
  <a href='${link}' target='_blank'>
    <img width='100%' src='${img}' alt='Featured image of ${title}' />
  </a>
  <br>
  <i>${title}</i>
</div>
         `
      return articleHtml
    })
    .join("\n");

  // replace all placeholders with info
  const newMarkdown = template.replace("%{{latest_articles}}%",latestArticlesMarkdown);

  await fs.writeFile("README.md", newMarkdown);
})();

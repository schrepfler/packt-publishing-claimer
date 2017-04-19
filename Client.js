const Promise = require("bluebird");
const cheerio = require("cheerio");
const request = require("request");
const requestPromise = require("request-promise");
const emoji = require("node-emoji");
const fs = require("fs");

class Crawler {
  constructor(config = {}) {
    this.config = config;
    this.baseUrl = "https://www.packtpub.com";
    this.cookieJar = request.jar();
    console.log("Constructor done.");
  }

  login() {
    console.log("Logging you in...");

    return this.doRequest("/packt/offers/free-learning")
      .then($ => {
        const $form = $("#packt-user-login-form");
        const data = $form
          .serializeArray()
          .reduce(
            (prev, curr) => Object.assign(prev, { [curr.name]: curr.value }),
            {}
          );

        data.email = this.config.email;
        data.password = this.config.password;
        data.op = "Login";

        return this.doRequest(
          "/packt/offers/free-learning",
          $form.attr("method"),
          data,
          {
            resolveWithFullResponse: true,
            transform: null,
            followAllRedirects: false
          }
        );
      })
      .then($ => {
        console.log(`Logged in successfully ${emoji.get("tada")}`);
        return $;
      })
      .catch(e => {
        if (
          e.response &&
          e.response.headers &&
          e.response.headers.location ===
            "https://www.packtpub.com/packt/offers/free-learning"
        ) {
          return this.doRequest(e.response.headers.location);
        }

        throw e;
      });
  }

  doRequest(requestUri, requestMethod = "get", data = {}, requestOptions = {}) {
    let uri = this.baseUrl;

    if (requestUri.indexOf(this.baseUrl) !== 0) {
      uri += `${requestUri}`;
    }

    const options = Object.assign(
      {
        uri,
        jar: this.cookieJar,
        transform: body =>
          cheerio.load(body, {
            normalizeWhitespace: true
          })
      },
      requestOptions
    );

    if (requestMethod.toLowerCase() === "post") {
      options.method = "post";
      options.form = data;
    }

    return requestPromise(options);
  }

  claimBook() {

    console.log("Claiming deal of the day...");

    return this.doRequest("/packt/offers/free-learning").then($ => {
      console.log(`${emoji.get("coffee")}`);

      const $dealOfTheDay = $("#deal-of-the-day");
      const $claimButton = $dealOfTheDay.find(".dotd-main-book-form.cf");
      const bookTitle = $dealOfTheDay
        .find(".dotd-title")
        .children()
        .html()
        .trim();
      const bookSummary = $claimButton.prev().html().trim();
      const bookImageUrl = $dealOfTheDay
        .find(".bookimage.imagecache.imagecache-dotd_main_image")
        .first()
        .attr("src");
      const claimUrl = $claimButton
        .find(".float-left.free-ebook")
        .children()
        .attr("href");

      console.log(`Current deal of the day title is '${bookTitle}'`);
      console.log(`${emoji.get("zap")} `);

      return {
        bookTitle,
        bookSummary,
        bookImage: `https:${bookImageUrl}`,
        claimUrl
      };
    });
  }
}

module.exports = Crawler;

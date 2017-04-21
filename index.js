"use strict";

/**
 * Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.claimBook = function claimBook(event, callback) {
  const config = require("./config.json");
  const request = require("request").defaults({
    jar: true // enable cookie support, default is false
  });
  const path = require("path");
  const fs = require("fs");
  const cheerio = require("cheerio");

  var packtpubBaseUrl = "https://www.packtpub.com";
  var packtpubDownloadEbookUrl =
    packtpubBaseUrl + "/ebook_download/{ebook_id}/{downloadFormat}";
  var packtpubFreeEbookUrl = packtpubBaseUrl + "/packt/offers/free-learning";
  var userLoginForm;
  var freeEbookUrl;
  var ebookId;
  var baseDownloadUrl;
  var downloadUrl;
  var freeEbookTitle;
  var formData = {
    email: config.packtpub.email,
    password: config.packtpub.password,
    op: "Login",
    form_build_id: "",
    form_id: ""
  };
  var downloadFormates = config.dowloadFormat.split(";");
  console.log("----- Start claim free ebook from packtpub -----");
  request(packtpubFreeEbookUrl, function(error, response, body) {
    if (error) {
      console.error("first get request", error);
    }
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      userLoginForm = $("#packt-user-login-form");
      formData.form_build_id = userLoginForm
        .find('[name="form_build_id"]')
        .val();
      formData.form_id = userLoginForm.find('[name="form_id"]').val();
      var relativeLink = $("a.twelve-days-claim").attr("href");
      freeEbookUrl = packtpubBaseUrl + relativeLink;
      ebookId = relativeLink.replace(
        /\/freelearning-claim\/([0-9]*)\/[0-9]*/g,
        "$1"
      );
      baseDownloadUrl = packtpubDownloadEbookUrl.replace("{ebook_id}", ebookId);
      console.log("Free Ebook Url: " + freeEbookUrl);
      freeEbookTitle = $(".dotd-title").find("h2").text().trim();
      console.log("Claim Title: " + freeEbookTitle);
      request.post(
        {
          url: packtpubFreeEbookUrl,
          formData: formData
        },
        function(error, response, body) {
          if (error) {
            console.error("auth failure", error);
          }
          if (!error && !body) {
            request(freeEbookUrl, function(error, response, body) {
              if (error) {
                console.error("claim error", error);
                inform("Got a error please check this!");
              }
              if (!error && response.statusCode == 200) {
                if (config.downloadAfterClaim) {
                  downloadFormates.forEach(function(dowloadFormat) {
                    downloadUrl = baseDownloadUrl.replace(
                      "{downloadFormat}",
                      dowloadFormat
                    );
                    request({
                      followAllRedirects: true,
                      url: downloadUrl
                    }).pipe(
                      fs.createWriteStream(
                        (config.outputDirectory != null
                          ? config.outputDirectory + path.sep
                          : "") +
                          freeEbookTitle +
                          "." +
                          dowloadFormat
                      )
                    );
                  });
                }
                inform("Sir, I've just claimed " + freeEbookTitle + " for you.");
                console.log("----- Done... -----");
              }
            });
          } else {
            console.error("auth failure", error);
          }
        }
      );
    }
  });
  callback();

  function inform(content) {
      console.log(content);
  }

};

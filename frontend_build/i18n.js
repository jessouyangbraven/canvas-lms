module.exports = function(input){
  throw "Should not ever make it to the actual i18n loader because those resources don't exist";
}


// This adapts the functionality of an old require-js plugin that would scope down
// the i18nObj when required with a given format require('i18n!some_scope').  We
// should probably phase this out over time in favor of not specifying loaders
// in require statements, but it seems to replace the functionality for now.
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  this.cacheable();
  var scopeName = this.query.replace("?", "");

  // translations generated by i18nliner have these prefixes that we can just
  // snip out before loading the scope
  //
  // plugins have their plugin name in the midst of app.gems.plugins.analytics.app.views.jst.something
  // so we need a regex that will filter those out too
  scopeName = scopeName.
    replace(/^[^\s]*\.app\.views\.jst\./,'').
    replace(/^[^\s]*\.ember\.([^\s]*\.)templates\./,'$1')

  if(scopeName.indexOf("ic_submission-download-dialog") > -1){
    // TODO: I'm so, so sorry about this.  Figure out how to scope
    // correctly for this one exceptional case later
  } else {
    scopeName = scopeName.replace(/-/, '_');
  }

  // in development, we can save bandwidth and build time by not bothering
  // to include translation artifacts during the build.
  var shouldTranslate = process.env.RAILS_LOAD_ALL_LOCALES || process.env.RAILS_ENV == 'production' || process.env.NODE_ENV == 'production';
  var translationDependency = "";
  if(shouldTranslate){
    translationDependency = " 'translations/" + scopeName + "', 'translations/_core',";
  }

  var scopedJavascript = "" +
    "define(['i18nObj'," + translationDependency + " 'translations/_core_en'], function(I18n) {" +
    "  return I18n.scoped('" + scopeName + "');" +
    "});";

  return scopedJavascript;
};

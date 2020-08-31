const visit=require('unist-util-visit');

const StringUtils=require('../../src/utils/string-utils');

module.exports = ( ...params ) => {
  let [{ markdownAST: ast, markdownNode, getNodes }, { locale }] = params;

  // TODO: [critical] remove locale validation if there is an en version
  // if ( markdownRemarkGatsbyNode.locale !== "ru" ) {
  //   return ast
  // }


  const HEADING_TAG_NAME = "heading";
  const TEXT_TAG_NAME = "text";
  const H1_TAG_DEPTH = 1;
  const H2_TAG_DEPTH = 2;

  const NODE_DEPTHS = new Set( [H1_TAG_DEPTH, H2_TAG_DEPTH] );
  const isHeadingTag = node => node.type === HEADING_TAG_NAME;
  const isDepth = node => NODE_DEPTHS.has( node.depth );
  const isHeading = node => isHeadingTag( node ) && isDepth( node );
  const isH1 = node => node.depth === H1_TAG_DEPTH;
  const isH2 = node => node.depth === H2_TAG_DEPTH;

  const isText = node => node.type === TEXT_TAG_NAME;


  const buttonInnerHtml = ( { path } ) => ( `
    <button class="content__button_copy-to-buffer" path="${ path }">
      <svg class="svg-icon copy-to-buffer-button__svg-icon" width="24" height="24" viewBox="0 0 24 24">
        <use xlink:href="#iconmonstr-link"></use>
      </svg>
      <div class="content__tooltip_copy-to-buffer tooltip">
        Скопировать ссылку в буффер обмена
      </div>
    </button>
  ` );

  visit( ast, isHeading, ( headingNode, index, tier ) => {
    let headingTextNode = headingNode.children.find( isText );
    let { value: heading } = headingTextNode;

    let path = "";


    if ( isH2( headingNode ) ) {
      path = StringUtils.chapterHeadingToPath( heading );
    }


    headingNode.children = [
      {
        type: "html",
        value: buttonInnerHtml({path}),
      },
      {
        type: "span",
        children: [{
          type: "text",
          value: heading
        }],
        data: {
          hName: "span"
        }
      }
    ];
  } );


  return ast;
};
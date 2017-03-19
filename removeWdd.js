const cheerio = require('cheerio')
const generate = require('babel-generator')
const traverse = require('babel-traverse')
const t = require('babel-types')
const {parse} = require('babylon')

const isWindowDDAssign = node => {
  if (t.isMemberExpression(node) && t.isMemberExpression(node.object)) {
    let {object, property} = node.object
    if (t.isIdentifier(object, {name: 'window'}) && t.isIdentifier(property, {name: 'document'})) {
      return t.isIdentifier(node.property, {name: 'domain'})
    }
  }
  return false
}

module.exports = body => {
  let found = false, $ = cheerio.load(body)
  $('head').find('script:not([src])').each(function (idx, elem) {
    const [{data}] = elem.children
    const ast = parse(data)
    traverse.default(ast, {
      AssignmentExpression(path) {
        if (found) { return }
        let {node: {left}} = path
        if (isWindowDDAssign(left)) {
          found = true
          path.remove()
        }
      }
    })
    if (found) {
      $(this).text(generate.default(ast, {}, '').code)
      return false
    }
  })
  return $.html()
}
import test from 'ava'
import preserveTrailingSpaceBeautify from './preserveTrailingSpaceBeautify'

test('preserveTrailingSpaceBeautify', t => {
  const input = `
function () {
	
	for (var i = 1; i < 10; i++) {
		
		var obj = { brabrabrabrabrabrabrabrabrabrabrabra: 
			'hogehogehogehogehogehogehogehogehogehogehogehoge' }  
		
	}
	
}
			`.trimLeft()
  const output = `
function() {
	
	for (var i = 1; i < 10; i++) {
		
		var obj = {
			brabrabrabrabrabrabrabrabrabrabrabra: 'hogehogehogehogehogehogehogehogehogehogehogehoge'
		}
		
	}
	
}
`.trimLeft()
  const options = {
    indent_with_tabs: true,
    end_with_newline: true,
    brace_style: 'collapse-preserve-inline'
  }
  t.is(preserveTrailingSpaceBeautify(input, options), output)
})

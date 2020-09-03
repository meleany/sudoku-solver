/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/
const puzzles = require('../public/puzzle-strings.js');
const chai = require("chai");
const assert = chai.assert;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let Solver;

suite('Functional Tests', () => {
  suiteSetup(() => {
    // DOM already mocked -- load sudoku solver then run tests
    //Solver = require('../public/sudoku-solver.js');
    // I added this 
    return JSDOM.fromFile('./views/index.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = dom.window.document;

        Solver = require('../public/sudoku-solver.js');
      });    
  });
  
  suite('Text area and sudoku grid update automatically', () => {
    // Entering a valid number in the text area populates 
    // the correct cell in the sudoku grid with that number
    //ai.request(server);
    test('Valid number in text area populates correct cell in grid', done => {
      const input = '..9..5.1.85.4.s..2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..60.';
      const textArea = document.getElementById("text-input");
      Solver.textFill(input);
      Solver.updateUsingTextArea();
            
      assert.equal(document.getElementById('A1').value,  '');   // '.' invalid character
      assert.equal(document.getElementById('A3').value,  '9');  // valid number
      assert.equal(document.getElementById('B6').value,  '');   // 's'  invalid character
      assert.equal(document.getElementById('I8').value,  '');  //  0 invalid number
      
      textArea.value = '123456';
      var event = document.createEvent("HTMLEvents");
      event.initEvent("keyup", false, true);
      textArea.dispatchEvent(event);
 
      assert.equal(document.getElementById('A1').value,  '1');
      assert.equal(document.getElementById('A3').value,  '3');
      assert.equal(document.getElementById('A6').value,  '6');

      done();
    });

    // Entering a valid number in the grid automatically updates
    // the puzzle string in the text area
    test('Valid number in grid updates the puzzle string in the text area', done => {
      const input = '2.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      const textArea = document.getElementById("text-input");
      textArea.value = input;
      Solver.updateUsingGrid();
      Solver.gridFill(input);
      var list = [1, 9, 0, 's', 8];
      var pos = ["A1", "I9", "I7", "A1", "B4"];
      var idx = [0, 80, 78, 0, 12];
      var res = ['1', '9', '.', '.', '8' ];
      var table = document.getElementById("sudoku-table");
      
      var event = document.createEvent("HTMLEvents");
      event.initEvent("input", false, true);
      
      list.forEach((item, index) => {
        table.value=item;
        table.id = pos[index];
        table.dispatchEvent(event);
        assert.equal(textArea.value[idx[index]], res[index]);
      });
      done();
    });
  });
  
  suite('Clear and solve buttons', () => {
    // Pressing the "Clear" button clears the sudoku grid and the text area
    test('Function clearInput()', done => {
      const input = ['..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', ''];
      const textArea = document.getElementById("text-input");
      const solveBut = document.getElementById("solve-button");
      const clearBut = document.getElementById("clear-button");
      const errorDiv = document.getElementById('error-msg');
      
      Solver.solveSudoku();
      Solver.clearSudoku();      
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", false, true);
      
      input.forEach((item) => {
        textArea.value = item;
        solveBut.dispatchEvent(evt);
        clearBut.dispatchEvent(evt); 
        assert.equal(textArea.value, '');
        assert.equal(errorDiv.innerHTML, '');
      });
      done();
    });
    
    // Pressing the "Solve" button solves the puzzle and
    // fills in the grid with the solution
    test('Function showSolution(solve(input))', done => {
      const textArea = document.getElementById("text-input");
      const solveBut = document.getElementById("solve-button");
      const listIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      
      Solver.solveSudoku();
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", false, true);
      
      puzzles.puzzlesAndSolutions.forEach( (item) => {
        textArea.value = item[0];
        solveBut.dispatchEvent(evt);
        var textInput = textArea.value;
        assert.equal(textArea.value, item[1]); 
        for(var i=0; i<81; i++) {  
          var charVal = textInput.charAt(i);
          var col = i % 9 + 1;
          var row = parseInt(i / 9);
          var cell_i = listIndex[row] + col; 
          assert.equal(document.getElementById(cell_i).value, charVal);
        }  
      });
      
      done();
    });
  });
});


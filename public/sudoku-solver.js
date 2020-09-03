const regex = /[1-9.]/;
const regex2 = /[1-9]/;
const regex3 = /^[1-9.]+$/;
const listIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const dim = 9;
const dim2 = dim * dim;
const subdim = 3;

// Function used to initialize sudoku.
function textFill(textVals) {
  document.getElementById('text-input').value = textVals;
  gridFill(textVals);
}

// Fills grid with valid numbers
function gridFill(textVals) {
  var len = textVals.length; 
  if(len < dim2) { 
    var nDots = dim2 - len;  
    textVals = textVals + '.'.repeat(nDots);
  }

  for(var i=0; i<dim2; i++) {  
    var charVal = textVals.charAt(i);
    var col = i % dim + 1;
    var row = parseInt(i / dim);
    var cell_i = listIndex[row] + col; 
    if(!regex2.test(charVal)) {   // Regex2 excludes the '.' 
      charVal = '';
    }
    document.getElementById(cell_i).value = charVal;
  }  
}
  
// Update grid area when valid input is entered in text area.
function updateUsingTextArea() {
  document.getElementById("text-input").addEventListener("keyup", function(e) {
    var textVals = document.getElementById("text-input").value;
    gridFill(textVals);
  });  
}

function updateUsingGrid() {
  document.getElementById("sudoku-table").addEventListener("input", function(e) {
    // Identify cell id position.
    var pos = e.target.id.split('');
    var row = listIndex.indexOf(pos[0]);
    var cell = dim*row + parseInt(pos[1]);
    var textVal = document.getElementById("text-input").value;
    var newCharVal = e.target.value;
    var len = textVal.length;
    
    // Check if textarea contains values and fills the rest of the string with dots.
    if(len < dim2) {
      var nDots = dim2 - len;  
      textVal = textVal + '.'.repeat(nDots);
    }
    if(!regex.test(newCharVal)) {
      newCharVal = '.';
    }
    
    var newTextVal = textVal.substr(0,cell-1) + newCharVal + textVal.substr(cell);
    document.getElementById("text-input").value = newTextVal;
  });  
}

function clearSudoku() {
  document.getElementById("clear-button").addEventListener("click", function() {
    document.getElementById("error-msg").innerHTML = "";
    document.getElementById("text-input").value = "";
    var classCell = document.getElementsByClassName("sudoku-input");
    for(var i=0; i<classCell.length; i++) {
      classCell[i].value = '';
    }
  });  
}

function solveSudoku() {
  document.getElementById("solve-button").addEventListener("click", function() {
    // Read and calculate the length of the sudoku in the text area.
    var sudokuText = document.getElementById("text-input").value;
    var sudokuLen = sudokuText.length;
    document.getElementById("error-msg").innerHTML = "";
    
    // Check if sudoku size is greater than dim2. Return ERROR.
    if(sudokuLen != dim2) { 
      document.getElementById("error-msg").innerHTML = "Error: Expected puzzle to be 81 characters long."; 
      return;
    }
    
    //Check if sudoku text contains invalid characters. Return ERROR.
    if(!regex3.test(sudokuText)) {
      document.getElementById("error-msg").innerHTML = "Error: Expected only valid numbers."; 
      return;      
    }
    
    var countDots = 0;
    var completeSudoku = false;
    for(var p=0; p<dim2; p++) {
      if(sudokuText[p] == '.') { countDots++; }
    }
    if(countDots == 0) {
      completeSudoku = true;
      sudokuText = '.' + sudokuText.substr(1); 
      document.getElementById("text-input").value = sudokuText;
      gridFill(sudokuText);
    }
    //document.getElementById("testdemo").innerHTML = sudokuText;
    // Solve sudoku. Populate 2D matrix and matrix of possible solutions with text/grid values.
    var countLoop = 0;
    var countLoopMax = 0;
    var matrix = [];
    var matSol = [];    
    for(var indx=0; indx<dim; indx++) {
      matrix[indx] = [];
      matSol[indx] = [];
    }
      
    for(var i=0; i<sudokuLen; i++) {
      var charVal = sudokuText.charAt(i);
      if(charVal == '.') {charVal = 0;  countLoopMax++; };        
      var col = i % dim;
      var row = parseInt(i / dim);
      matrix[row][col] = charVal;
      if(charVal != 0){ 
        matSol[row][col] = charVal; 
      }else{
        matSol[row][col] = [1,2,3,4,5,6,7,8,9];
      } 
    }

    // Check if there are repeated elements in matrix by rows. If not, add possible sols to matrix of sols.    
    var findSol = true;
    var repeated = false;
    var matChanged = true;
    // Solving only easy sudokus. Need to add second part to solve more complex sudokus.
    while(matChanged==true && countLoop < countLoopMax) {
      matChanged = false;
      for(var i=0; i<dim; i++) {
        var newArr = matrix[i].slice(0).sort();
        var indexArr = newArr.findIndex((val) => { return val > 0; });
        newArr = newArr.slice(indexArr);
        repeated = new Set(newArr).size != newArr.length;
        if(repeated) {
          findSol = false;
          if(completeSudoku) {
            document.getElementById("error-msg").innerHTML = 'Invalid sudoku puzzle.';
          }    
          return;
        }
      
        for(var jj=0; jj<dim; jj++) {
          if(1<matSol[i][jj].length){
            for(var n=0; n<newArr.length; n++){
              var index = matSol[i][jj].indexOf(parseInt(newArr[n]));
              if(-1 < index) {
                if(1 < matSol[i][jj].length) {
                  matSol[i][jj] = matSol[i][jj].slice(0);
                  matSol[i][jj].splice(index, 1);
                  matChanged = true;
                }
              }
            }  
          } 
        }      
      }
    
      // Check if there are repeated elements in matrix by columns. If not, update possible sols in matrix of sols.        
      if(findSol) {
        var j=0;
        for(var j=0; j<dim; j++) {
          var arrCol = [];
          for(var i=0; i<dim; i++) {
            arrCol[i] = matrix[i][j];  
          }
          var newArr = arrCol.slice(0).sort(); 
          var indexArr = newArr.findIndex((val) => { return val > 0; });
          newArr = newArr.slice(indexArr);
          repeated = new Set(newArr).size != newArr.length;
          if(repeated) {
            findSol = false;
            if(completeSudoku) {
              document.getElementById("error-msg").innerHTML = 'Invalid sudoku puzzle.';
            } 
            return;
          }
          var rowIndx = 0;
          while(rowIndx < dim) {
            for(var n=0; n<newArr.length; n++) { 
              var num = parseInt(newArr[n]);
              var index = matSol[rowIndx][j].indexOf(num);
              if(-1 < index) {
                if(1 < matSol[rowIndx][j].length) {
                  matSol[rowIndx][j] = matSol[rowIndx][j].slice(0);  // Use slice() to create copy and avoid unwanted weird results.
                  matSol[rowIndx][j].splice(index, 1);
                  matChanged = true;
                }
              }
            }
            rowIndx++;
          }
        }     
      }

      // Check if there are repeated elements in matrix by sections. If not, update possible sols in matrix of sols.    
      if(findSol) {
        outerLoop:  // Name outerloop to break nested loops.
        for(var p1=0; p1<subdim; p1++) {
          var newPos1 = p1 * subdim;
          for(var p2=0; p2<subdim; p2++) {
            var newPos2 = p2 * subdim;
            var arrSector = [];
            // Gather all the values in one section.
            for(var i=0+newPos1; i<subdim+newPos1; i++) {
              for(var j=0+newPos2; j<subdim+newPos2; j++) {
                if(matSol[i][j].length == 1) {
                  arrSector.push(matSol[i][j]);
                }
              } 
            }
            var newArr = arrSector.slice(0).sort();
            repeated = new Set(newArr).size != newArr.length;
            if(repeated){
              findSol = false;
              if(completeSudoku) {
                document.getElementById("error-msg").innerHTML = 'Invalid sudoku puzzle.';
              }    
              break outerLoop;
            }
            for(var ii=0+newPos1; ii<subdim+newPos1; ii++) {
              for(var jj=0+newPos2; jj<subdim+newPos2; jj++) {
                for(var n=0; n<newArr.length; n++) { 
                  var num = parseInt(newArr[n]);
                  var index = matSol[ii][jj].indexOf(num);
                  if(-1 < index) {
                    if(1 < matSol[ii][jj].length) {
                      matSol[ii][jj] = matSol[ii][jj].slice(0);  // Use slice() to create copy and avoid unwanted weird results.
                      matSol[ii][jj].splice(index, 1);
                      matChanged = true;
                    }
                  }
                }
              }
            }
          }
        }
      
        var textVals = '';
        for(var i=0; i<dim; i++) {
          for(var j=0; j<dim; j++) {
            var charVal = '.';
            if(matSol[i][j].length == 1 ){
              charVal = matSol[i][j]; 
              matrix[i][j] = matSol[i][j].slice(0);
            }
            textVals = textVals + charVal;
          }
        }
        document.getElementById("text-input").value = textVals;
        gridFill(textVals);
        countLoop++;
      }
    } // END OF WHILE LOOP  
    // Need to add second part to solve complex sudokus.
  });  
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialization. Load a simple puzzle into the text and grid areas
  var textVals  = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  textFill(textVals);
  
  // Calls the function that clears text, grid and error message areas.
  clearSudoku();
  
  // Calls the function to update grid area when valid input is entered in text area.
  updateUsingTextArea();
  
  // Calls the function to update text area when valid input is entered in grid.
  updateUsingGrid();
 
  // Calls function to attempt solving the sudoku puzzle.
  solveSudoku();    
});

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {
    textFill,
    gridFill,
    updateUsingTextArea,
    updateUsingGrid,
    clearSudoku,
    solveSudoku
  }
} catch (e) {}
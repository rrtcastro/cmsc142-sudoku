var sizeOfBoard = -1; //stupid ass GLOBAL
var solutions = [];
var karaokeMode = false;
var puzzles = [];
var currentPuzzleIndex = 0;

/*
solutions:[],
solutionsX:[],
solutionsY:[],
solutionsXY:[]
*/

$(document).ready(function(){
	var $fileInput = $('#file-input');
	var $sudokuBoardWrapper = $('#sudoku-board-wrapper');
	var reader = new FileReader();

	//http://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
	var imageInput = document.getElementById('image-input');
	imageInput.onchange = function (evt) {

	    var tgt = evt.target || window.event.srcElement,
		        files = tgt.files;

		    // FileReader support
		    if (FileReader && files && files.length) {
		        var fr = new FileReader();
		        fr.onload = function () {
		            document.getElementById("image-output").src = fr.result;
		        }
		        fr.readAsDataURL(files[0]);
		    }

		OCRAD(document.getElementById("image-output"),function(text){
	    	text = fixText(text); 
	    	alert(text);
	    	processFile('',text);
	    });
	}

	//load file on filechooser value changed
	$fileInput.on('change', function(){
		var file = $fileInput[0].files[0];
		reader.readAsText(file);
	});

	//process file on load
	reader.onload = function(){processFile(reader,'');}; //async function call

	$.get('input.in', function(data) {
		processFile({result:data},'');
	});

	$('#prev-puzzle-button').on('click', function(){
		$currentTable = $sudokuBoardWrapper.find('table:visible');
		if($currentTable.prev().length > 0){
			$sudokuBoardWrapper.children('table:visible').fadeOut(500, function(){
				$(this).prev().fadeIn(500);
			});
			currentPuzzleIndex--;
		}else{
			$sudokuBoardWrapper.children('table:visible').fadeOut(500, function(){
				$sudokuBoardWrapper.children('table').last().fadeIn(500);
			});
			currentPuzzleIndex = $sudokuBoardWrapper.children().length - 1;
		}
		
	});

	$('#next-puzzle-button').on('click', function(){

		$currentTable = $sudokuBoardWrapper.find('table:visible');
		if($currentTable.next().length > 0){
			$sudokuBoardWrapper.children('table:visible').fadeOut(500, function(){
				$(this).next().fadeIn(500);
			})
			currentPuzzleIndex++;
		}else{
			$sudokuBoardWrapper.children('table:visible').fadeOut(500, function(){
				$sudokuBoardWrapper.children('table').first().fadeIn(500);
			});
			currentPuzzleIndex = 0;
		}
	})

	$('#sudoku-check-button').on('click', function(){
		var valid = isSolutionValid();
		if(valid){

			if(karaokeMode){
				var videoHTML = '<video class="karaoke-video" class="karaoke-video" src="video/score.mkv" autoplay/>';
				$('#video-wrapper').html(videoHTML);
				$('video.karaoke-video')[0].addEventListener('loadedmetadata', function(){
					this.currentTime = 4;
				}, false);	
			}else{
				alert("Congratulations! You solved the puzzle.");
			}
				
		}else{
			alert("Aw :(, There's something wrong with your solution. Find the problem and try again");
		}
	});

	$('#karaoke-button').on('click', function(){
		$('.header-container,.footer-container').fadeOut(2000);
		$('#karaoke-songlist').fadeIn(2000);
		$('.main-container').fadeTo(2000, 0.75)
		var videoHTML = '<video class="karaoke-video" class="karaoke-video" src="video/13579.mkv" autoplay/>';
		$('#video-wrapper').html(videoHTML);
		karaokeMode = true;
		$('#karaoke-singet')[0].play();
	});


	$('#song-picker').on("keyup", function(e){
		if(e.keyCode == 13){//ENTER KEY
			var val = $(this).val();
			$(this).val('');
			
			var songNumber = $('#song-table tr#'+val+' td.song-number span').text();

			if(songNumber != ''){
				var videoHTML = '<video class="karaoke-video" src="video/'+songNumber+'.mkv" autoplay/>';
				$('#video-wrapper').html(videoHTML);
				$('#karaoke-singet')[0].play();	
			}
			
		}
	})

	$('#song-picker').on("keydown", function(e){
		if($(this).val().length < 5 && e.keyCode >= 48 && e.keyCode <= 57){
			var number = e.keyCode - 48;
			$('#karaoke-'+number)[0].cloneNode().play();
		}else if(!(e.keyCode == 8)){
			e.preventDefault();
		}
	})

	$('#sudoku-showsolutions-button').on("click", function(){
		if($(this).val() == 'Show Solutions'){
			var puzzle = puzzles[currentPuzzleIndex];

			var sudokuXEnabled = $('#sudoku-x-checkbox').is(':checked');
			var sudokuYEnabled = $('#sudoku-y-checkbox').is(':checked');

			var solutions;
			if(sudokuXEnabled && sudokuYEnabled){
				solutions = puzzle.solutionsXY;
			}else if(sudokuXEnabled){
				solutions = puzzle.solutionsX;
			}else if(sudokuYEnabled){
				solutions = puzzle.solutionsY;
			}else{
				solutions = puzzle.solutions;
			}

			if(solutions.length > 0){
				displaySolutions(puzzle.board, solutions);
				$(this).val("Hide Solutions");
				$('#sudoku-control-panel').fadeOut(500);
			}else{
				alert("There are no solutions. sorry.");
			}
		}else{
			hideSolutions();
			$('#sudoku-control-panel').fadeIn(500);
		}
		
	});

});

function fixText(text){

	var i, j;
	var size;
	var res = text.replace(/o/gi,'0');
	res = res.replace('l','1');
	res = res.replace(/s/gi,'5');
	res = res.replace(/[a-zA-Z]/g,'0');

	var origText = '';

	var lines = res.split('\n');
	for(i=0; i < lines.length - 1; i++){
		var numbers = lines[i].split(' ');

		for(j=0; j < numbers.length; j++){

			origText = origText + numbers[j] + ' ';

		}

		if(i==0)
			size = j;

		for(var k = j; k < size; k++){

			origText = origText + '0 ';

		}


		origText = origText + '\n';


	}

	origText = sqrt(size) + '\n' + origText;
	origText = '1\n' + origText;

	return origText;

}

var currentSolution = 0;
function displaySolutions(board, solutions){
	var $sudokuBoardWrapper = $('#sudoku-board-wrapper');
	var $table = $('#sudoku-board-wrapper').find('table:visible');

	var controlPanelHTML = "<div id='solutions-control'><input id='prev-solution' type='button' value='Prev'/>";
	controlPanelHTML += "<input id='next-solution' type='button' value='Next'/>";
	controlPanelHTML += "<span id='solution-label'>Solution <span id='solution-number'></span> of <span id='solution-count'>"+solutions.length+"</span></span></div>";
	var $solutionsWrapper = $('#solutions-wrapper');	
	$solutionsWrapper.prepend(controlPanelHTML);
	$('#prev-solution').on("click", function(){
		$('#sudoku-solution-board').fadeOut(500, function(){
			$(this).remove();

			--currentSolution<0?currentSolution = solutions.length-1:-1;
			displaySolution(board, solutions[currentSolution], currentSolution );
		})
		
	});
	$('#next-solution').on("click", function(){
		$('#sudoku-solution-board').fadeOut(500, function(){
			$(this).remove();

			++currentSolution>=solutions.length? currentSolution = 0:-1;
			displaySolution(board, solutions[currentSolution], currentSolution);
		});
	});

	$table.fadeOut(500, function(){
		displaySolution(board, solutions[0], 0);
		$solutionsWrapper.fadeIn(500);
	});
}

function displaySolution(origBoard, solution, index){
	$('#solution-number').text(""+(index + 1));
	currentSolution = index;

	var board = solution;

	var $solutionsWrapper = $('#solutions-wrapper');

	var boardHTML = "<table class='sudoku' id='sudoku-solution-board' style='display:none'>"; 

	for(var i = 0; i < board.length; i++){
		var rowHTML = "<tr class='sudoku-row'>";
		for(var j = 0; j < board[i].length; j++){
			var columnHTML = "";
			if(origBoard[i][j] == 0){
				columnHTML += "<td class='sudoku-element-solved'><span>"+board[i][j]+"</span";
			}else{
				columnHTML += "<td class='sudoku-element'><span>"+board[i][j]+"</span";
			}
			columnHTML += "</td>";
			rowHTML += columnHTML;
		}
		rowHTML += "</tr>";
		boardHTML += rowHTML;
	}

	boardHTML += "</table>";
	
	$solutionsWrapper.append(boardHTML);
	var $newTable = $solutionsWrapper.find("table").last();
	var boxSize = sqrt(board.length);
	$newTable.find("td:nth-child("+boxSize+"n)").css("border-right", "solid");
	$newTable.find("tr:nth-child("+boxSize+"n) td").css("border-bottom", "solid");
	$newTable.fadeIn(500);
}

function hideSolutions(){
	$('#solutions-wrapper').fadeOut(500, function(){
		$(this).empty();
		console.log("index:"+currentPuzzleIndex);
		$($('#sudoku-board-wrapper').children('table')[currentPuzzleIndex]).fadeIn(500);
		$('#sudoku-showsolutions-button').val("Show Solutions");
	});
}

function processFile(reader, input){
	$('#sudoku-board-wrapper').children('table').remove();
	var text;

	if(input=='')
		text = reader.result;

	else
		text = input;

	// split by lines
    var lines = text.split('\n');
    var lineIndex = 0; //initial line number

    var numCases = parseInt(lines[lineIndex++]);
    
    console.log("num of cases:" + numCases);
    for(var caseNumber = 0; caseNumber < numCases; caseNumber++){
    	/*
    		console.log("Below are the remaining unread lines in file with starting line index: " +lineIndex);
    		printRemainingLines(lines,lineIndex);
    		console.log("--------------");
    	/*/
    	var gridSize = parseInt(lines[lineIndex++]);
    	sizeOfBoard = gridSize*gridSize;//GLOBAL: see topmost

    	console.log("size of board:"+ sizeOfBoard);

    	var result = initBoard(lines, lineIndex); // returns result[board, numOfZero]
    	lineIndex += sizeOfBoard; //update lineIndex iterated in initBoard (js has no pass by reference)

    	var board = result[0];
    	var numOfZero = result[1];

    	printBoard(board); //print board for debuggingh
    	puzzles.push({
    		board:board,
    		solutions: [],
    		solutionsX: [],
    		solutionsY: [],
    		solutionsXY: []
    	});

    	displayBoard(board, caseNumber);

    	var blankSpaces = createArrayOfZero(board, numOfZero);

    	var nopts = new Array(numOfZero+2);
    	var option = new Array(numOfZero+2);
    	for(var i = 0; i < option.length; i++){
    		option[i] = new Array(numOfZero+2);
    	}

    	var solutionStr = "";
    	for(sudokusolution = 0; sudokusolution < 4; sudokusolution++){
			
			if(sudokusolution==0)
				solutionStr +=  "============== NORMAL SUDOKU ===============\n";
			else if(sudokusolution==1) solutionStr +=  "============== SUDOKU X ===============\n";
			else if(sudokusolution==2) solutionStr += "============== SUDOKU Y ===============\n";
			else if(sudokusolution==3) solutionStr += "============== SUDOKU XY ===============\n";

			var solutions = [];
			
			count = 0;
			move=start=0;
			nopts[start]=1; //[1,0,0,0,0]
			while(nopts[start]>0){
				if(nopts[move]>0){
					move++;
					nopts[move]=0;
					if(move==numOfZero+1){
						count++;
						solutionStr += "Solution number "+count+"\n";
						solutionStr += "Possible solution set:\n";
						
						a=1;
						for(i=1;i<move;i++)
							solutionStr += option[i][nopts[i]]+" ";
						solutionStr += "\n\n";
						
						var solution = [];

						for(i=0;i<sizeOfBoard;i++){
							var solutionRow = [];
							for(j=0;j<sizeOfBoard;j++){
								if(board[i][j]==0){
									var val = option[a][nopts[a]];
									solutionStr += val+" ";
									solutionRow.push(val);
									a++;
								}
								else{
									solutionStr += board[i][j] + " ";
									solutionRow.push(board[i][j]);
								}
							}
							solutionStr += "\n";
							solution.push(solutionRow);
						}
						solutionStr += "\n\n";	
						solutions.push(solution);
					}
					else if(move==1){
						for(candidate=sizeOfBoard;candidate>=1;candidate--){
							row=checkRow(candidate, blankSpaces[move-1], board);
							column=checkColumn(candidate, blankSpaces[move-1], board);
							box=checkBox(candidate, blankSpaces[move-1], board);
					
							if(row && column && box){
								nopts[move]++;
								option[move][nopts[move]]=candidate;
							}
						}
					}
			
					else{
						for(candidate=sizeOfBoard;candidate>=1;candidate--){
							row=checkRow(candidate, blankSpaces[move-1], board);
							column=checkColumn(candidate, blankSpaces[move-1], board);
							box=checkBox(candidate, blankSpaces[move-1], board);
							ekis=checkEkis(candidate, blankSpaces[move-1], board);
							huay=checkHuay(candidate, blankSpaces[move-1], board);
			
							if(row && column && box && sudokusolution == 0){
			
								for(i=move-1;i>=1;i--){
									if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || 
										blankSpaces[i-1].y==blankSpaces[move-1].y || (toInt(blankSpaces[i-1].x/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											toInt(blankSpaces[i-1].y/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
								}
							
								if(i==0)
									option[move][++nopts[move]] = candidate;
							
							}
							
							if(row && column && box && ekis && sudokusolution == 1){
			
								for(i=move-1;i>=1;i--){
									if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || 
										blankSpaces[i-1].y==blankSpaces[move-1].y || (toInt(blankSpaces[i-1].x/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											toInt(blankSpaces[i-1].y/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
					
									if(((blankSpaces[move-1].x == blankSpaces[move-1].y && blankSpaces[i-1].x == blankSpaces[i-1].y) || (blankSpaces[move-1].x + blankSpaces[move-1].y == sizeOfBoard - 1 && blankSpaces[i-1].x + blankSpaces[i-1].y == sizeOfBoard - 1)) && (candidate==option[i][nopts[i]])){
										break;	
									}
						

								}
							
								if(i==0)
									option[move][++nopts[move]] = candidate;
							
							}
							
							if(row && column && box && huay && sudokusolution == 2){
			
								for(i=move-1;i>=1;i--){
									if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || 
										blankSpaces[i-1].y==blankSpaces[move-1].y || (toInt(blankSpaces[i-1].x/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											toInt(blankSpaces[i-1].y/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
					
									if(checkHuay2(candidate, option[i][nopts[i]], blankSpaces[move-1], blankSpaces[i-1])){
										break;	
									}
						

								}
							
								if(i==0)
									option[move][++nopts[move]] = candidate;
							
							}

							if(row && column && box && ekis && huay && sudokusolution == 3){
			
								for(i=move-1;i>=1;i--){
									if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || 
										blankSpaces[i-1].y==blankSpaces[move-1].y || (toInt(blankSpaces[i-1].x/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											toInt(blankSpaces[i-1].y/sqrt(sizeOfBoard))==toInt(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
					
									if(((blankSpaces[move-1].x == blankSpaces[move-1].y && blankSpaces[i-1].x == blankSpaces[i-1].y) || (blankSpaces[move-1].x + blankSpaces[move-1].y == sizeOfBoard - 1 && blankSpaces[i-1].x + blankSpaces[i-1].y == sizeOfBoard - 1)) && (candidate==option[i][nopts[i]])){
										break;	
									}

									if(checkHuay2(candidate, option[i][nopts[i]], blankSpaces[move-1], blankSpaces[i-1])){
										break;	
									}
						

								}
							
								if(i==0)
									option[move][++nopts[move]] = candidate;
							
							}
						}
					}
			
				}
				else{
					move--;
					nopts[move]--;
				}
			}

			if(sudokusolution==0) puzzles[caseNumber].solutions = solutions;
			else if(sudokusolution==1) puzzles[caseNumber].solutionsX = solutions;
			else if(sudokusolution==2) puzzles[caseNumber].solutionsY = solutions;
			else if(sudokusolution==3) puzzles[caseNumber].solutionsXY = solutions;
		
		}
		console.log(solutionStr);
		$('#solution-textarea').append(document.createTextNode(solutionStr)); //proper appending
    }

    if(numCases > 0){
    	$('#sudoku-aside').fadeIn(2000);
    }

    //console.log(puzzles);

}


/* ===== DEBUG FUNCTIONS ===== */
function printRemainingLines(lines, lineIndex){
	for(var i = lineIndex; i < lines.length; i++){
		console.log(lines[i]);
	}
}

function printBoard(board){
	for(var i = 0; i < board.length; i++){
		console.log(board[i]);
	}
}
/* ==== UI FUNCTIONS ====*/
function displayBoard(board, caseNumber){
	var $boardWrapper = $('#sudoku-board-wrapper');

	var boardHTML = "<table class='sudoku' id='sudoku-board-caseNumber' style='display:none'>"; 

	for(var i = 0; i < board.length; i++){
		var rowHTML = "<tr class='sudoku-row'>";
		for(var j = 0; j < board[i].length; j++){
			var columnHTML = "";
			if(board[i][j] == 0){
				columnHTML += "<td class='sudoku-element-blank'><input id='test' class='sudoku' type='number' min='1' max='9'/>";
			}else{
				columnHTML += "<td class='sudoku-element'><span>"+board[i][j]+"</span";
			}
			columnHTML += "</td>";
			rowHTML += columnHTML;
		}
		rowHTML += "</tr>";
		boardHTML += rowHTML;
	}

	boardHTML += "</table>";
	
	$boardWrapper.append(boardHTML);
	var $newTable = $boardWrapper.find("table").last();
	var boxSize = sqrt(board.length);
	$newTable.find("td:nth-child("+boxSize+"n)").css("border-right", "solid");
	$newTable.find("tr:nth-child("+boxSize+"n) td").css("border-bottom", "solid");
	if(caseNumber==0){
		$newTable.fadeIn(2500);
	}
}

function getBoardValueAt(row, col){
	var $table = $('#sudoku-board-wrapper').find('table:visible');
	var $rows = $table.find('tr');
	var row = $rows[row];
	var element = $(row).children('td')[col];
	var val = -1;
	if($(element).hasClass('sudoku-element')){
		val = parseInt($(element).find('span').text());
	}else{
		val = parseInt($(element).children('input').val());
		if(!(val > 0 && val <= $rows.length)){
			val = -1;
		}
	}

	return val;
}

/* ==== BOARD FUNCTIONS ====*/
function isSolutionValid(){
	var sudokuXEnabled = $('#sudoku-x-checkbox').is(':checked');
	var sudokuYEnabled = $('#sudoku-y-checkbox').is(':checked');

	$currentTable = $('#sudoku-board-wrapper').find('table:visible');
	var $rows = $currentTable.find('tr');


	var values = new Array($rows.length);
	for(var i = 0 ; i < values.length; i++){
		values[i] = i+1;
	}
	var checker = values.slice(0); //array to check if solution is valid
	var valid = true;//check if solution is valid

	var boardSize = $rows.length;

	//Check if all rows have valid input
	for(var i = 0; i < boardSize && valid; i++){
		checker = values.slice(0); //refill checker
		for(var j = 0; j < boardSize && valid; j++){
			var val = getBoardValueAt(i, j);
			var index = checker.indexOf(val);
			//console.log(val+ " " + index);
			index > -1? checker.splice(index, 1) : valid = false;
		};
	}

	//Check if all cols have valid input
	for(var i = 0; i < boardSize && valid; i++){
		checker = values.slice(0); //refill checker
		for(var j = 0; j < boardSize && valid; j++){
			var val = getBoardValueAt(j, i);
			var index = checker.indexOf(val);
			//console.log(val+ " " + index);
			index > -1? checker.splice(index, 1) : valid = false;
		};
	}

	//Check if all boxes have valid input
	var boxSize = sqrt(boardSize);
	for(var h = 0; h < boxSize && valid; h++){//row boxes
		for(var i = 0; i < boxSize && valid; i++){ //box columns
			checker = values.slice(0);
			for(var j = i*boxSize; j < i*boxSize + boxSize && valid; j++){//rows per box
				for(var k = h*boxSize; k < h*boxSize + boxSize && valid; k++){//columns per box
					var val = getBoardValueAt(j, k);
					var index = checker.indexOf(val);
					//console.log(val+ " " + index);
					index > -1? checker.splice(index, 1) : valid = false;
				}
			}
		}
	}
	

	if(sudokuXEnabled){
		//check diagonals
		checker = values.slice(0); //refill checker
		var checker2 = values.slice(0);
		for(var i = 0; i < boardSize && valid; i++){
			var val = getBoardValueAt(i, i);
			var index = checker.indexOf(val);
			index > -1? checker.splice(index, 1) : valid = false;

			val = getBoardValueAt(i, (boardSize-1) - i);
			index = checker2.indexOf(val);
			index > -1? checker2.splice(index, 1) : valid = false;
		}
	}

	if(sudokuYEnabled){
		checker = values.slice(0); //refill checker
		var checker2 = values.slice(0);
		for(var i = 0, j = 0; i < boardSize && valid; i++, (j<boardSize/2 - 1?j++:j)){ //stop column increment at middle
			var val = getBoardValueAt(i, j);
			var index = checker.indexOf(val);
			index > -1? checker.splice(index, 1) : valid = false;

			val = getBoardValueAt(i, (boardSize-1) - j);
			index = checker2.indexOf(val);
			index > -1? checker2.splice(index, 1) : valid = false;
		}
	}
	
	return valid;
}

function createArrayOfZero(board, numOfZero){
	var blankSpaces = [];

	for(var i = 0; i < numOfZero; i++){
		blankSpaces.push({x:-1, y:-1}); //add an object with x,y ; -1 means unassigned
	}

	var bRef = 0;
		
	for(var i=0; i<sizeOfBoard; i++){
		for(var j=0; j<sizeOfBoard; j++){
			if(board[i][j]==0){
				blankSpaces[bRef].x = j;
				blankSpaces[bRef].y = i;
				bRef++;
			}
		}
	}

	return blankSpaces;
}

function initBoard(lines, lineIndex){
	var board = [];//2D array board
	var numOfZero = 0;

	for(var i=0; i < sizeOfBoard; i++){
		vals = lines[lineIndex++].split(' ');

		var row = [];//row array for board
		for(var j=0; j < sizeOfBoard; j++){
			var val = parseInt(vals[j]);
			
			row.push(val);	
			if(val==0)
				numOfZero++;
		}
		board.push(row);
	}

	//printBoard(*board);
	return [board, numOfZero];

}

/* ==== SOLUTION FINDING FUNCTIONS ==== */
function checkRow(candidate, blankSpace, board){
	var y = blankSpace.y;
	for(var i=0; i<sizeOfBoard; i++){
	
		if(i==blankSpace.x)
			continue;
		
		if(candidate == board[y][i])
			return 0;
	
	}

	return 1;
}

function checkColumn(candidate, blankSpace, board){
	var x = blankSpace.x;
	for(var i=0; i<sizeOfBoard; i++){
	
		if(i==blankSpace.y)
			continue;
		
		if(candidate == board[i][x])
			return 0;
	
	}

	return 1;
}

function checkBox(candidate, blankSpace, board){
	var y = blankSpace.y;
	var x = blankSpace.x;
	
	var gridx = toInt(x/sqrt(sizeOfBoard));
	var gridy = toInt(y/sqrt(sizeOfBoard));
	
	for(var i=0+(gridy*sqrt(sizeOfBoard)); i<sqrt(sizeOfBoard)+(gridy*sqrt(sizeOfBoard)); i++){
	
		for(var j=0+(gridx*sqrt(sizeOfBoard)); j<sqrt(sizeOfBoard)+(gridx*sqrt(sizeOfBoard)); j++){
			
			if(candidate == board[i][j])
				return 0;
		}
	}

	return 1;
}

function checkEkis(candidate, blankSpace, board){
	if((blankSpace.x == blankSpace.y)||(blankSpace.x+blankSpace.y == sizeOfBoard-1)){
	
		for(var i=0, j=0; i<sizeOfBoard; i++, j++){
			if(candidate == board[i][j])
				return 0;
		}
		
		for(var i=sizeOfBoard-1, j=0; i>=0; i--, j++){
			if(candidate == board[i][j])
				return 0;
		}
	
	}
	
	return 1;

}

function checkHuay(candidate, blankSpace, board){
	if(sizeOfBoard%2==0)	return 1;
	
	var i=0, j=0;
	while(i<sizeOfBoard){
	
		if(candidate == board[i][j])
				return 0;
	
		if(toInt(sizeOfBoard/2) != j) j++;
		i++;
	
	}
	
	i=0, j=sizeOfBoard-1;
	while(i<sizeOfBoard){
	
		if(candidate == board[i][j])
				return 0;
	
		if(toInt(sizeOfBoard/2) != j) j--;
		i++;
	
	}
	
	return 1;

}

function checkHuay2(candidate, option, move, checksol){
	
	if(move.y == move.x){
		if(checksol.y == checksol.x){
			if(candidate == option)
				return 0;
		}
	}
	
	if(move.x + move.y == sizeOfBoard - 1){
		if(checksol.x + checksol.y == sizeOfBoard - 1){
			if(candidate == option)
				return 0;
		}
	}
	
	if(move.x == checksol.x && move.y > sizeOfBoard/2){
		if(candidate == option)
			return 0;
	}
	
	return 1;
}

/* === PORT UTILS === */

//http://stackoverflow.com/questions/596467/how-do-i-convert-a-float-number-to-a-whole-number-in-javascript
function toInt(value) { return ~~value; }
function sqrt(value){ return Math.sqrt(value); }
function append(str, toAppend){ return str += toAppend; }
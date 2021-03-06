#include<stdio.h>
#include<stdlib.h>
#include<math.h>

int sizeOfBoard;

typedef struct node{
	int x, y;
}list;

int checkRow(int candidate, list blankSpace, int **board){
	int i;
	int y = blankSpace.y;
	for(i=0; i<sizeOfBoard; i++){
	
		if(i==blankSpace.x)
			continue;
		
		if(candidate == board[y][i])
			return 0;
	
	}

	return 1;
}
int checkColumn(int candidate, list blankSpace, int **board){
	int i;
	int x = blankSpace.x;
	for(i=0; i<sizeOfBoard; i++){
	
		if(i==blankSpace.y)
			continue;
		
		if(candidate == board[i][x])
			return 0;
	
	}

	return 1;
}
int checkBox(int candidate, list blankSpace, int **board){
	int i,j;
	int y = blankSpace.y;
	int x = blankSpace.x;
	
	int gridx = (int)(x/sqrt(sizeOfBoard));
	int gridy = (int)(y/sqrt(sizeOfBoard));
	
	for(i=0+(gridy*sqrt(sizeOfBoard)); i<sqrt(sizeOfBoard)+(gridy*sqrt(sizeOfBoard)); i++){
	
		for(j=0+(gridx*sqrt(sizeOfBoard)); j<sqrt(sizeOfBoard)+(gridx*sqrt(sizeOfBoard)); j++){
			
			if(candidate == board[i][j])
				return 0;
		}
	}

	return 1;
}

int checkEkis(int candidate, list blankSpace, int **board){

	int i,j;

	if((blankSpace.x == blankSpace.y)||(blankSpace.x+blankSpace.y == sizeOfBoard-1)){
	
		for(i=0, j=0; i<sizeOfBoard; i++, j++){
			if(candidate == board[i][j])
				return 0;
		}
		
		for(i=sizeOfBoard-1, j=0; i>=0; i--, j++){
			if(candidate == board[i][j])
				return 0;
		}
	
	}
	
	return 1;

}

int checkHuay(int candidate, list blankSpace, int **board){

	int i, j;
	
	if(sizeOfBoard%2==0)	return 1;
	
	i=0, j=0;
	while(i<sizeOfBoard){
	
		if(candidate == board[i][j])
				return 0;
	
		if((int)(sizeOfBoard/2) != j) j++;
		i++;
	
	}
	
	i=0, j=sizeOfBoard-1;
	while(i<sizeOfBoard){
	
		if(candidate == board[i][j])
				return 0;
	
		if((int)(sizeOfBoard/2) != j) j--;
		i++;
	
	}
	
	return 1;

}

int checkHuay2(int candidate, int option, list move, list checksol){
	
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

void createBoard(int ***board){
	int i,j;


	(*board) = (int **)malloc(sizeof(int *)*sizeOfBoard);
	for(i=0; i<sizeOfBoard; i++){
		(*board)[i] = (int *)malloc(sizeof(int)*sizeOfBoard);
		for(j=0; j<sizeOfBoard; j++){
			(*board)[i][j] = 0;
		}
	}
}


void printBoard(int **board){
	int i,j;

	printf("\n");
	for(i = 0; i < sizeOfBoard ; i++){
		for(j = 0; j < sizeOfBoard; j++){
			printf("%2d", board[i][j]);
		}
		printf("\n");
	}
}


int initBoard(FILE *fp, int ***board, int *numCases){
	int val, numOfZero = 0;
	int i, j;

	fscanf(fp, "%d", &sizeOfBoard);
	
	sizeOfBoard *= sizeOfBoard;
	
	createBoard(board);
	
	//Reading of file. Assuming input file has correct structure. Fix l8r
	for(i=0; i<sizeOfBoard; i++){
		for(j=0; j<sizeOfBoard; j++){
		
			fscanf(fp, "%d", &val);
			(*board)[i][j] = val; 		
			if(val==0)
				numOfZero++;
		}
	}

	//printBoard(*board);
	
	return numOfZero;

}

void createArrayOfZero(list **blankSpaces, int **board, int numOfZero){

	int i, j, bRef = 0;
	
	(*blankSpaces) = (list *)malloc(sizeof(list)*numOfZero);
	
	for(i=0; i<sizeOfBoard; i++){
		for(j=0; j<sizeOfBoard; j++){
			if(board[i][j]==0){
				(*blankSpaces)[bRef].x = j;
				(*blankSpaces)[bRef].y = i;
				bRef++;
			}
		}
	}
	
}

int main(int argc, char *argv[]){
	FILE *fp = NULL;
	int count = 0;
	int start,move;
	int *nopts;//nopts[N+2];//n options // top of stacks
	int **option;//option[N+2][N+2]; //options //stacks
	int i,j,candidate,a=0;	
	list *blankSpaces;
	int **board;
	int numOfZero;
	char *filename;

	int row=0, column=0, box=0, ekis=0, huay=0;

	int numCases;
	int caseNumber;
	int sudokusolution;
	
	if(argc < 2){
		printf("To run: ./executable_file input.in > output_file\n");
		exit(1);
	}

	filename = argv[1];

	if((fp = fopen(filename, "r")) == NULL){
		printf("Error reading %s.\n", filename);
		exit(-1);
	}

	fscanf(fp, "%d", &numCases);

	for(caseNumber = 0; caseNumber < numCases; caseNumber++){
		
			numOfZero = initBoard(fp, &board, &numCases);
			printBoard(board);
			createArrayOfZero(&blankSpaces, board, numOfZero);
			printf("size of board:%d\n", sizeOfBoard);
			nopts = (int *)malloc(sizeof(int)*(numOfZero+2));
			option = (int **)malloc(sizeof(int*)*(numOfZero+2));
			for(i=0; i<numOfZero+2; i++){
				option[i] = (int *)malloc(sizeof(int)*(numOfZero+2));
			}
			
			for(sudokusolution = 0; sudokusolution < 3; sudokusolution++){
			
			if(sudokusolution==0)
			printf("============== NORMAL SUDOKU ===============\n");
						else if(sudokusolution==1)printf("============== SUDOKU X ===============\n");
									else printf("============== SUDOKU Y ===============\n");
			
			count = 0;
			move=start=0;
			nopts[start]=1; //[1,0,0,0,0]
			while(nopts[start]>0){
				if(nopts[move]>0){
					move++;
					nopts[move]=0;
					if(move==numOfZero+1){
						count++;
						printf("Solution number %d\n", count);
						printf("Possible solution set:\n");
			
						a=1;
						for(i=1;i<move;i++)
							printf("%2i", option[i][nopts[i]]);
						printf("\n\n");
				
						for(i=0;i<sizeOfBoard;i++){
							for(j=0;j<sizeOfBoard;j++){
								if(board[i][j]==0){
									printf("%2i", option[a][nopts[a]]);
									a++;
								}
								else
									printf("%2i", board[i][j]);
							}
							printf("\n");
						}
						printf("\n\n");			
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
										blankSpaces[i-1].y==blankSpaces[move-1].y || ((int)(blankSpaces[i-1].x/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											(int)(blankSpaces[i-1].y/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
								}
							
								if(i==0)
									option[move][++nopts[move]] = candidate;
							
							}
							
							if(row && column && box && ekis && sudokusolution == 1){
			
								for(i=move-1;i>=1;i--){
									if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || 
										blankSpaces[i-1].y==blankSpaces[move-1].y || ((int)(blankSpaces[i-1].x/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											(int)(blankSpaces[i-1].y/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
					
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
										blankSpaces[i-1].y==blankSpaces[move-1].y || ((int)(blankSpaces[i-1].x/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].x/sqrt(sizeOfBoard)) && 
											(int)(blankSpaces[i-1].y/sqrt(sizeOfBoard))==(int)(blankSpaces[move-1].y/sqrt(sizeOfBoard))))) break;
					
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
		
		}
		
			free(nopts);
			free(option);
			free(board);
			free(blankSpaces);

	}
	
	fclose(fp);
	
	return 0;
}

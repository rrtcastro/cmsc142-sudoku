#include<stdio.h>
#include<stdlib.h>
#define sizeOfBoard 9

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
	
	int gridx = x/3;
	int gridy = y/3;
	
	for(i=0+(gridy*3); i<3+(gridy*3); i++){
	
		for(j=0+(gridx*3); j<3+(gridx*3); j++){
			
			if(candidate == board[i][j])
				return 0;
		}
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

int initBoard(int ***board, char *filename){

	FILE *fp;
	int val, numOfZero = 0;
	int i, j;
	
	if((fp = fopen(filename, "r")) == NULL){
		printf("Error reading %s.\n", filename);
		exit(-1);
	}
	
	//Reading of file. Assuming input file has correct structure. Fix l8r
	for(i=0; i<sizeOfBoard; i++){
		for(j=0; j<sizeOfBoard; j++){
		
			fscanf(fp, "%d", &val);
			(*board)[i][j] = val; 		
			if(val==0)
				numOfZero++;
		}
	}
	
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

	int start,move;
	int *nopts;//nopts[N+2];//n options // top of stacks
	int **option;//option[N+2][N+2]; //options //stacks
	int i,j,candidate,a=0;
	
	list *blankSpaces;
	int **board;
	int numOfZero;
	char *filename;
	int row=0, column=0, box=0;
	
	if(argc < 2){
		printf("To run: ./executable_file input.in > output_file\n");
		exit(1);
	}
	
	createBoard(&board);
	numOfZero = initBoard(&board, argv[1]);
	createArrayOfZero(&blankSpaces, board, numOfZero);
	
	nopts = (int *)malloc(sizeof(int)*(numOfZero+2));
	option = (int **)malloc(sizeof(int*)*(numOfZero+2));
	for(i=0; i<numOfZero+2; i++){
		option[i] = (int *)malloc(sizeof(int)*(numOfZero+2));
	}
	
	move=start=0;
	nopts[start]=1; //[1,0,0,0,0]
	while(nopts[start]>0){
		if(nopts[move]>0){
			move++;
			nopts[move]=0;
			if(move==numOfZero+1){
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
					
					if(row && column && box){
						for(i=move-1;i>=1;i--){
							if(candidate==option[i][nopts[i]] && (blankSpaces[i-1].x==blankSpaces[move-1].x || blankSpaces[i-1].y==blankSpaces[move-1].y || (blankSpaces[i-1].x/3==blankSpaces[move-1].x/3 && blankSpaces[i-1].y/3==blankSpaces[move-1].y/3))) break;
						}
						if(i==0)
							option[move][++nopts[move]]=candidate;
					}
				}
			}
		}
		else{
			move--;
			nopts[move]--;
		}
	}
	
	free(nopts);
	free(option);
	free(board);
	free(blankSpaces);

return 0;
}

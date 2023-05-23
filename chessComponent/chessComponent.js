import { LightningElement, track } from 'lwc';
import {getPawnPosition,getRookPosition,getBishopPosition,getKnightPosition, getQueenPosition, getKingPosition} from './utilities';	
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ChessComponent extends LightningElement {
    
    // [
    //     {
    //       position:d1,
    //       initial:pawn1,
    //       type:pawn,
    //       current:pawn1,
    //       color:black
    //     }
    // ]

    @track character = ['KING','QUEEN','KNIGHT','BISHOP','ROOK','PAWN'];
    @track rows = ['A','B','C','D','E','F','G','H'];
    @track columns = [1,2,3,4,5,6,7,8];
    @track dataSet = [];

    @track selectedElement;
    @track availableSteps = [];
    @track availableAttacks = [];
    @track toggler = 'white';

    //attacking positions
    @track whiteAttacksPosition = {};
    @track blackAttacksPosition = {};

    //store all dead elements
    @track whiteDeadElement = [];
    @track blackDeadElement = [];
    
    //king positions
    @track whiteKing = [];
    @track blackKing = [];

    isWhiteCheck = false;
    isBlackCheck = false;

    //store all six element castle info
    isWhiteKingMoved = false;
    isBlackKingMoved = false;
    isWhiteRook1Moved = false;
    isWhiteRook2Moved = false;
    isBlackRook1Moved = false;
    isBlackRook2Moved = false;

    //store messages
    @track toastMessage = [];

    //store history of move
    @track moveHitory = [];

    //player timer
    whiteSecond = 0;
    blackSecond = 0;
    whiteMinute = 10;
    blackMinute = 10;

    whiteFirstMove = false;
    blackFirstMove = false;

    isGameEnd = false;
    viewGameEnd = false;
    winner = 'none';

    //for pawn replacement
    isPawnReplaceMent = false;
    @track pawnElement = null;
    @track whiteReBorn = {};
    @track blackReBorn = {};

    //sound effect
    moveSound = 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3';
    captureSound = 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3';
    notifySound = 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/notify.mp3';
    castleSound = 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3';

    connectedCallback(){
        //create chess board dataset
        this.createDataSet();
    }

    //main click event for box
    handleClick(event){
        // console.log(event.currentTarget);
        // console.log(event.currentTarget.dataset);
        var data = event.currentTarget.dataset;
        var currentElement = this.dataSet[data.y][data.x];
        // console.log(JSON.stringify(this.selectedElement));

        //clear all selected
        this.clearSelected();
        
        if (!this.isGameEnd) {
            if(currentElement.current != null){
                
                //call handler
                if(event.currentTarget.classList.contains('available-attack')){
                    console.log('Attack Perform');
    
                    //replace current position to targeted position
                    var selectedTemp = {...this.selectedElement};
                    var currentTemp = {...currentElement};
    
                    currentElement = {...currentElement,type:this.selectedElement.type,current:this.selectedElement.current,cssClass:this.selectedElement.cssClass,color:this.selectedElement.color};
                    this.selectedElement = {...this.selectedElement,type:null,current:null,cssClass:null,color:null};
                    
                    this.dataSet[currentElement.y][currentElement.x] = currentElement;
                    this.dataSet[this.selectedElement.y][this.selectedElement.x] = this.selectedElement;
                    
                    //update king position
                    if(currentElement.type == this.character[0]){
                        if(currentElement.color == 'white'){
                            this.whiteKing = [currentElement.y,currentElement.x];
                            this.isWhiteKingMoved = true;
                        }else{
                            this.blackKing = [currentElement.y,currentElement.x];
                            this.isBlackKingMoved = true;
                        }
                    }
                    //update new attacking positions
                    this.onPositionChange();
    
                    //is king have check after this move - if yes then prevent this move else perform this move
                    if(!this.validatePosition(currentElement.color == 'white' ? this.whiteKing : this.blackKing,currentElement.color)){
                        //if king have check then stop this move
                        console.log(currentElement.color+' King Have Check !');
                        this.selectedElement = {...selectedTemp};
                        currentElement = {...currentTemp};
                        
                        this.dataSet[currentElement.y][currentElement.x] = currentElement;
                        this.dataSet[this.selectedElement.y][this.selectedElement.x] = this.selectedElement;
    
                        //update king position to old position
                        if(this.selectedElement.type == this.character[0]){
                            if(this.selectedElement.color == 'white'){
                                this.whiteKing = [this.selectedElement.y,this.selectedElement.x];
                                this.isWhiteKingMoved = false;
                            }else{
                                this.blackKing = [this.selectedElement.y,this.selectedElement.x];
                                this.isBlackKingMoved = false;
                            }
                        }
    
                        this.onPositionChange();
                        this.addToastMessage('error',`${this.toggler.toUpperCase()} have Check !`);
                        
                    }else{
                        // handle animation
                        this.handleAttackAnimation(event.currentTarget)
                        
                        //for castle check ROOK moved or not
                        if(currentElement.type == this.character[4]){
                            if(currentElement.color == 'white'){
                                if(currentElement.current == 'ROOK1'){
                                    this.isWhiteRook1Moved = true;
                                }else{
                                    this.isWhiteRook2Moved = true;
                                }
                            }else{
                                if(currentElement.current == 'ROOK1'){
                                    this.isBlackRook1Moved = true;
                                }else{
                                    this.isBlackRook2Moved = true;
                                }
                            }
                        }
    
                        //for check
                        // if(currentElement.color == 'white'){
                        //     this.isBlackCheck = !this.validatePosition(this.blackKing,'black');
                        // }else{
                        //     this.isWhiteCheck = !this.validatePosition(this.whiteKing,'white');
                        // }
                        // console.log('White check : '+this.isWhiteCheck);
                        // console.log('Black check : '+this.isBlackCheck);

                        // check the check mate after this move to the opposite player
                        // if check mate then game end
                        if(!this.validatePosition((currentElement.color == 'white' ? this.blackKing : this.whiteKing),(currentElement.color == 'white' ? 'black' : 'white'))){
                            console.log('After Attack Check : '+(currentElement.color == 'white' ? 'black' : 'white')+' check');
                            this.validateCheck((currentElement.color == 'white' ? 'black' : 'white'));
                        }

                        //check the pawn replacement
                        if(currentElement.type == this.character[5]){

                            if((currentElement.color == 'white' && currentElement.y == 7) || (currentElement.color == 'black' && currentElement.y == 0)){
                                
                                console.log('Pawn Replacement !');
                                this.isPawnReplaceMent = true;
                                this.pawnElement = {...currentElement};
                            }

                        }
    
                        //store dead element
                        if (currentTemp.color == 'white') {
                            var index = this.character.indexOf(currentTemp.type);
                            
                            this.whiteDeadElement[index] = this.whiteDeadElement[index] ? {count:this.whiteDeadElement[index].count+1,cssClass:currentTemp.cssClass}  : {count:1,cssClass:currentTemp.cssClass};
                            
                        }else{
                            var index = this.character.indexOf(currentTemp.type);
    
                            this.blackDeadElement[index] = this.blackDeadElement[index] ? {count:this.blackDeadElement[index].count+1,cssClass:currentTemp.cssClass}  : {count:1,cssClass:currentTemp.cssClass};
                            
                        }
    
                        //store history of move
                        this.moveHitory.push({initial:this.selectedElement.position,end:currentElement.position,cssClass:currentElement.cssClass});
    
                        //play capture sound
                        this.playAudio(this.captureSound);
        
                        //call toggler
                        this.toggleMove();
                        
                    }
                    //clear all available
                    this.clearAvailableSteps();
                    //clear all available attacks
                    this.clearAvailableAttacks();
                    //clear all available checks
                    this.clearAvailableChecks();
                    //clear all available castle
                    this.clearAvailableCastle();
    
                    
                }
                else{
                    if (currentElement.color == this.toggler) {
                        console.log('Element Selected');
                        
                        //add current element as selected
                        event.currentTarget.classList.add('selected');
    
                        this.handleMoves(currentElement);
                    }else{
                        
                        //clear all available
                        this.clearAvailableSteps();
                        //clear all available attacks
                        this.clearAvailableAttacks();
                        //clear all available checks
                        this.clearAvailableChecks();
                        //clear all available castle
                        this.clearAvailableCastle();
                        console.log(this.toggler+' move');
                        this.addToastMessage('warning',`${this.toggler.toUpperCase()} Turn !`);
                    }
                }
                
            }else{
                
                if(event.currentTarget.classList.contains('available')){
                    //move to next position
                    
                    //replace current position to targeted position
                    currentElement = {...currentElement,type:this.selectedElement.type,current:this.selectedElement.current,cssClass:this.selectedElement.cssClass,color:this.selectedElement.color};
                    this.selectedElement = {...this.selectedElement,type:null,current:null,cssClass:null,color:null};
                    
                    this.dataSet[currentElement.y][currentElement.x] = currentElement;
                    this.dataSet[this.selectedElement.y][this.selectedElement.x] = this.selectedElement;
                    
                    //update king position
                    if(currentElement.type == this.character[0]){
                        if(currentElement.color == 'white'){
                            this.whiteKing = [currentElement.y,currentElement.x];
                            this.isWhiteKingMoved = true;
                        }else{
                            this.blackKing = [currentElement.y,currentElement.x];
                            this.isBlackKingMoved = true;
                        }
                    }
    
                    //update new attacking positions
                    this.onPositionChange();
    
                    //is king have check after this move - if yes then prevent this move else perform this move
                    if(!this.validatePosition(currentElement.color == 'white' ? this.whiteKing : this.blackKing,currentElement.color)){
                        console.log(currentElement.color+' King Have Check !');
                        //if king have check then stop this move
                        this.selectedElement = {...this.selectedElement,type:currentElement.type,current:currentElement.current,cssClass:currentElement.cssClass,color:currentElement.color};
                        currentElement = {...currentElement,type:null,current:null,cssClass:null,color:null};
                        
                        this.dataSet[currentElement.y][currentElement.x] = currentElement;
                        this.dataSet[this.selectedElement.y][this.selectedElement.x] = this.selectedElement;
                        
                        //update king position to old position
                        if(this.selectedElement.type == this.character[0]){
                            if(this.selectedElement.color == 'white'){
                                this.whiteKing = [this.selectedElement.y,this.selectedElement.x];
                                this.isWhiteKingMoved = false;
                            }else{
                                this.blackKing = [this.selectedElement.y,this.selectedElement.x];
                                this.isBlackKingMoved = false;
                            }
                        }
                        this.onPositionChange();
                        this.addToastMessage('error',`${this.toggler.toUpperCase()} have Check !`);
    
                    }else{
    
                        //for timer
                        if (currentElement.color == 'white') {
                            this.whiteFirstMove = true;
                        }else{
                            this.blackFirstMove = true;
                        }
    
                        //for castle check ROOK moved or not
                        if(currentElement.type == this.character[4]){
                            if(currentElement.color == 'white'){
                                if(currentElement.current == 'ROOK1'){
                                    this.isWhiteRook1Moved = true;
                                }else{
                                    this.isWhiteRook2Moved = true;
                                }
                            }else{
                                if(currentElement.current == 'ROOK1'){
                                    this.isBlackRook1Moved = true;
                                }else{
                                    this.isBlackRook2Moved = true;
                                }
                            }
                        }
    
                        //for check
                        // if(currentElement.color == 'white'){
                        //     this.isBlackCheck = !this.validatePosition(this.blackKing,'black');
                        // }else{
                        //     this.isWhiteCheck = !this.validatePosition(this.whiteKing,'white');
                        // }
                        // console.log('White check : '+this.isWhiteCheck);
                        // console.log('Black check : '+this.isBlackCheck);

                        // check the check mate after this move to the opposite player
                        // if check mate then game end
                        if(!this.validatePosition((currentElement.color == 'white' ? this.blackKing : this.whiteKing),(currentElement.color == 'white' ? 'black' : 'white'))){
                            console.log('After Attack Check : '+(currentElement.color == 'white' ? 'black' : 'white')+' check');
                            this.validateCheck((currentElement.color == 'white' ? 'black' : 'white'));
                        }

                        //check the pawn replacement
                        if(currentElement.type == this.character[5]){

                            if((currentElement.color == 'white' && currentElement.y == 7) || (currentElement.color == 'black' && currentElement.y == 0)){
                                
                                console.log('Pawn Replacement !');
                                this.isPawnReplaceMent = true;
                                this.pawnElement = {...currentElement};
                            }

                        }
    
                        //store history of move
                        this.moveHitory.push({initial:this.selectedElement.position,end:currentElement.position,cssClass:currentElement.cssClass});
    
                        //play move sound
                        this.playAudio(this.moveSound);
        
                        //call toggler
                        this.toggleMove();
    
                    }
    
                    // console.log(JSON.stringify(this.whiteAttacksPosition));
                    // console.log(JSON.stringify(this.blackAttacksPosition));
                    
                }
                else if(event.currentTarget.classList.contains('castle')){
                    console.log('Castle Perform !');
                    //replace current King position to targeted position
                    currentElement = {...currentElement,type:this.selectedElement.type,current:this.selectedElement.current,cssClass:this.selectedElement.cssClass,color:this.selectedElement.color};
                    this.selectedElement = {...this.selectedElement,type:null,current:null,cssClass:null,color:null};
    
                    this.dataSet[currentElement.y][currentElement.x] = currentElement;
                    this.dataSet[this.selectedElement.y][this.selectedElement.x] = this.selectedElement;
    
                    //replace rook positions
                    if((this.selectedElement.x - currentElement.x) < 0){
                        console.log('Right Castle !');
                        if (currentElement.color == 'white') {
                            this.isWhiteRook2Moved = true;
                        }else{
                            this.isBlackRook2Moved = true;
                        }
                        var rook = this.dataSet[currentElement.y][7];
                        
                        this.dataSet[currentElement.y][currentElement.x-1] = {...this.dataSet[currentElement.y][currentElement.x-1],type:rook.type,current:rook.current,cssClass:rook.cssClass,color:rook.color};
                        this.dataSet[rook.y][rook.x] = {...rook,type:null,current:null,cssClass:null,color:null};
                        
                    }else{
                        console.log('Left Castle !');
                        if (currentElement.color == 'white') {
                            this.isWhiteRook1Moved = true;
                        }else{
                            this.isBlackRook1Moved = true;
                        }
    
                        var rook = this.dataSet[currentElement.y][0];
                        
                        this.dataSet[currentElement.y][currentElement.x+1] = {...this.dataSet[currentElement.y][currentElement.x+1],type:rook.type,current:rook.current,cssClass:rook.cssClass,color:rook.color};
                        this.dataSet[rook.y][rook.x] = {...rook,type:null,current:null,cssClass:null,color:null};
    
                    }
    
                    //update king position
                    if(currentElement.type == this.character[0]){
                        if(currentElement.color == 'white'){
                            this.whiteKing = [currentElement.y,currentElement.x];
                            this.isWhiteKingMoved = true;
                        }else{
                            this.blackKing = [currentElement.y,currentElement.x];
                            this.isBlackKingMoved = true;
                        }
                    }
    
                    //update new attacking positions
                    this.onPositionChange();
    
                    //play move sound
                    this.playAudio(this.castleSound);
        
                    //call toggler
                    this.toggleMove();
    
    
                }
    
                //clear all available
                this.clearAvailableSteps();
                //clear all available attacks
                this.clearAvailableAttacks();
                //clear all available checks
                this.clearAvailableChecks();
                //clear all available castle
                this.clearAvailableCastle();
            }
        }

        //stop event propagation
        event.stopPropagation();
    }

    //handle all moves
    handleMoves(element){
        this.selectedElement = element;
        //clear all available steps
        this.clearAvailableSteps();
        //clear all available attacks
        this.clearAvailableAttacks();
        //clear all available checks
        this.clearAvailableChecks();
        //clear all available castle
        this.clearAvailableCastle();

        //store available steps | here we clear the old values
        this.availableSteps = [];
        //store available attacks | here we clear the old values
        this.availableAttacks = [];

        if(this.selectedElement.type == this.character[5]){
            this.handlePawn();
        }
        else if(this.selectedElement.type == this.character[4]){
            this.handleRook();
        }
        else if(this.selectedElement.type == this.character[3]){
            this.handleBishop();
        }
        else if(this.selectedElement.type == this.character[2]){
            this.handleKnight();
        }
        else if(this.selectedElement.type == this.character[1]){
            this.handleQueen();
        }else{
            this.handleKing();
        }

    }

    //handle pawn[5]
    handlePawn(){
        var positions = getPawnPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        //add current element available steps
        this.availableSteps.forEach(([y,x]) => {
            if(this.dataSet[y][x].current == null){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available');
            }
        });
        
        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available-attack');
            }
        });

    }

    //handle rook[4]
    handleRook(){
        var positions = getRookPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        //add current element available steps
        this.availableSteps.forEach(([y,x]) => {
            if(this.dataSet[y][x].current == null){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available');
            }
        });
        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available-attack');
            }
        });
    }

    //handle bishop[3]
    handleBishop(){
        var positions = getBishopPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        //add current element available steps
        this.availableSteps.forEach(([y,x]) => {
            if(this.dataSet[y][x].current == null){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available');
            }
        });

        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available-attack');
            }
        });
    }

    //handle knight[2]
    handleKnight(){
        var positions = getKnightPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        //add current element available steps
        this.availableSteps.forEach(([y,x]) => {
            if(this.dataSet[y][x].current == null){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available');
            }
        });
        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available-attack');
            }
        });
    }

    //handle queen[1]
    handleQueen(){
        var positions = getQueenPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        //add current element available steps
        this.availableSteps.forEach(([y,x]) => {
            if(this.dataSet[y][x].current == null){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available');
            }
        });

        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                this.template.querySelector(`.column${y}${x}`)
                .classList.add('available-attack');
            }
        });
    }

    //handle king[0]
    handleKing(){
        var positions = getKingPosition(this.selectedElement,this.dataSet);
        this.availableSteps = [...positions.steps];
        this.availableAttacks = [...positions.attacks];

        var availableCastle = [];
        //get castle steps
        if(this.selectedElement.initial == this.selectedElement.current){
            if(this.dataSet[this.selectedElement.y][this.selectedElement.x+1].current == null && 
                this.dataSet[this.selectedElement.y][this.selectedElement.x+2].current == null &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x],this.selectedElement.color) &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x+1],this.selectedElement.color) &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x+2],this.selectedElement.color) &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x+3].current != null &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x+3].type == this.character[4] &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x+3].color == this.selectedElement.color){

                if(this.selectedElement.color == 'white' && !this.isWhiteRook2Moved  && !this.isWhiteKingMoved){

                    availableCastle.push([this.selectedElement.y,this.selectedElement.x+2]);
                }
                if(this.selectedElement.color == 'black' && !this.isBlackRook2Moved  && !this.isBlackKingMoved){
                    availableCastle.push([this.selectedElement.y,this.selectedElement.x+2]);

                }

            }
            if(this.dataSet[this.selectedElement.y][this.selectedElement.x-1].current == null && 
                this.dataSet[this.selectedElement.y][this.selectedElement.x-2].current == null &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x-3].current == null &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x],this.selectedElement.color) &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x-1],this.selectedElement.color) &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x-2],this.selectedElement.color) &&
                this.validatePosition([this.selectedElement.y,this.selectedElement.x-3],this.selectedElement.color) &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x-4].current != null &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x-4].type == this.character[4] &&
                this.dataSet[this.selectedElement.y][this.selectedElement.x-4].color == this.selectedElement.color){

                if(this.selectedElement.color == 'white' && !this.isWhiteRook1Moved && !this.isWhiteKingMoved){

                    availableCastle.push([this.selectedElement.y,this.selectedElement.x-2]);
                }
                if(this.selectedElement.color == 'black' && !this.isBlackRook1Moved && !this.isBlackKingMoved){
                    availableCastle.push([this.selectedElement.y,this.selectedElement.x-2]);
                }
            }
        }

        //add castle class
        availableCastle.forEach(([y,x]) => {
            this.template.querySelector(`.column${y}${x}`)
                    .classList.add('castle');
        });

        //add current element available steps
        this.availableSteps.forEach(([y,x],i) => {
            if(this.dataSet[y][x].current == null){
                
                if (this.validatePosition([y,x],this.selectedElement.color)) {
                    
                    this.template.querySelector(`.column${y}${x}`)
                    .classList.add('available');
                }
                else{
                    this.template.querySelector(`.column${y}${x}`)
                    .classList.add('available-check');
                }
            }
        });

        //add current element avaialable attacks
        this.availableAttacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color != this.selectedElement.color){
                if (this.validatePosition([y,x],this.selectedElement.color)) {

                    this.template.querySelector(`.column${y}${x}`)
                    .classList.add('available-attack');
                }
                else{
                    this.template.querySelector(`.column${y}${x}`)
                    .classList.add('available-check');
                }
            }
        });
    }

    //validate position in oposite player attacking positions
    validatePosition(position,color){
        // console.log('validate');
        // console.log(JSON.stringify(position));
        var a = true;
        if (color == 'white') {
            // console.log('color match');
            
            Object.keys(this.blackAttacksPosition).forEach((key,i) => {
                // console.log('here');
                Object.keys(this.blackAttacksPosition[key]).forEach((innerKey,i) => {
                    // console.log('inner');
                    // console.log(JSON.stringify(this.blackAttacksPosition[key][innerKey]));
                    this.blackAttacksPosition[key][innerKey].forEach(ele => {
                        // console.log(JSON.stringify(ele[0]));
                        if(position[0] == ele[0] && position[1] == ele[1]){
                            // console.log(position[0]+' '+position[1]+' '+ele[0]+' '+ele[1]);
                            a = false;
                            console.log('validatePosition : White Check');
                        }
                    });
                });
            });
        }
        else {
            // console.log('color match');

            Object.keys(this.whiteAttacksPosition).forEach((key,i) => {
                // console.log('here');
                Object.keys(this.whiteAttacksPosition[key]).forEach((innerKey,i) => {
                    // console.log('inner');
                    // console.log(JSON.stringify(this.whiteAttacksPosition[key][innerKey]));
                    this.whiteAttacksPosition[key][innerKey].forEach(ele => {
                        // console.log(JSON.stringify(ele[0]));
                        if(position[0] == ele[0] && position[1] == ele[1]){
                            // console.log(position[0]+' '+position[1]+' '+ele[0]+' '+ele[1]);
                            a = false;
                            console.log('validatePosition : Black Check');
                        }
                    });
                });
            });
        }
        return a;
    }

    //validate king check here
    validateCheck(color){
        var kingPosition = (color == 'white' ? this.whiteKing : this.blackKing);
        
        var king = this.dataSet[kingPosition[0]][kingPosition[1]];
        
        var availableMove = getKingPosition(king,this.dataSet);
        console.log(JSON.stringify(availableMove));

        var totalMove = availableMove.steps.length + availableMove.attacks.length;
        var attackMoves = [];
        console.log('Total Move : '+totalMove);

        availableMove.steps.forEach(([y,x]) => {

            attackMoves.push([y,x]);
            if(!this.validatePosition([y,x],color)){
                totalMove--;
            }
        });
        
        availableMove.attacks.forEach(([y,x]) => {
            if(this.dataSet[y][x].current != null && this.dataSet[y][x].color == color){
                totalMove--;
            }else{
                attackMoves.push([y,x]);
                if(!this.validatePosition([y,x],color)){
                    totalMove--;
                }
            }
        });
        console.log('After Cal Total Move : '+totalMove);
        console.log('All Attacks : '+JSON.stringify(attackMoves));

        var isCheckmate = true;

        //if king can move in any ways
        if(totalMove != 0){

            console.log('King Can move in '+totalMove+' ways !');
            attackMoves.forEach(([y,x]) => {
                //replace king position
                //then, if check is not available then is check mate is false
                var temp = {...this.dataSet[y][x]};

                this.dataSet[y][x] = {...this.dataSet[y][x],type:king.type,current:king.current,cssClass:king.cssClass,color:king.color};
                this.dataSet[kingPosition[0]][kingPosition[1]] = {...king,type:null,current:null,cssClass:null,color:null};
                
                this.onPositionChange();
                
                if(this.validatePosition([y,x],color)){
                    isCheckmate = false;
                }
                this.dataSet[y][x] = {...this.dataSet[y][x],type:temp.type,current:temp.current,cssClass:temp.cssClass,color:temp.color};
                this.dataSet[kingPosition[0]][kingPosition[1]] = {...king,type:king.type,current:king.current,cssClass:king.cssClass,color:king.color};

                this.onPositionChange();
            });

        }

        //if any element can stop the checkmate by moveing position and attack
        console.log('Check Attacks : '+JSON.stringify(attackMoves));
        if (color == 'white') {
            var tempWhite = {...this.whiteAttacksPosition};

            var mainKeys = Object.keys(tempWhite);

            for (let i = 0; i < mainKeys.length; i++) {
                
                var key = mainKeys[i];
                var innerKeys = Object.keys(tempWhite[key]);
                
                if (!isCheckmate) break;

                for (let j = 0; j < innerKeys.length; j++) {

                    var innerKey = innerKeys[j];

                    if (!isCheckmate) break;

                    if(!innerKey.includes('-POSITION')){
                        // console.log(innerKey);
                        var positions = tempWhite[key][innerKey];
                        for (let k = 0; k < positions.length; k++) {
                            var [y,x] = positions[k];

                            if (!isCheckmate) break;
                            
                            //change the position for temporary
                            var defendElementPosition = tempWhite[key][innerKey+'-POSITION'];
                            var defendElement = {...this.dataSet[defendElementPosition[0]][defendElementPosition[1]]};
                            var defendTarget = {...this.dataSet[y][x]};

                            if(defendTarget.current == null || (defendTarget.current != null && defendTarget.color == 'black')){
                                
                                this.dataSet[defendTarget.y][defendTarget.x] = {...defendTarget,type:defendElement.type,current:defendElement.current,cssClass:defendElement.cssClass,color:defendElement.color};
                                this.dataSet[defendElement.y][defendElement.x] = {...defendElement,type:null,current:null,cssClass:null,color:null};
                                //then update new attacking position
                                this.onPositionChange();
                                //if element is king then update king position
                                if(this.dataSet[defendTarget.y][defendTarget.x].type == this.character[0]){

                                    this.whiteKing = [defendTarget.y,defendTarget.x];
                                }
                                //then, if king not have a check after this move
                                //then is check mate = false
                                if(this.validatePosition(this.whiteKing,color)){
                                    isCheckmate = false;
                                    // console.log('After If '+this.validatePosition(this.whiteKing,color));
                                    // console.log(JSON.stringify(this.whiteKing)+' '+color);
                                    // console.log('Element '+JSON.stringify(defendElement));
                                    // console.log('Target '+JSON.stringify(defendTarget));
                                    // console.log('Dataset '+JSON.stringify(this.dataSet));
                                    // console.log('Black Attack Position '+JSON.stringify(this.blackAttacksPosition));
                                }
                                if(this.dataSet[defendTarget.y][defendTarget.x].type == this.character[0]){

                                    this.whiteKing = [defendElement.y,defendElement.x];
                                }

                                //replace current to old position
                                var defendElement = this.dataSet[defendElementPosition[0]][defendElementPosition[1]];
                                var newDefendTarget = this.dataSet[y][x];
                                
                                this.dataSet[defendElement.y][defendElement.x] = {...defendElement,type:newDefendTarget.type,current:newDefendTarget.current,cssClass:newDefendTarget.cssClass,color:newDefendTarget.color};
                                this.dataSet[defendTarget.y][defendTarget.x] = {...defendTarget,type:defendTarget.type,current:defendTarget.current,cssClass:defendTarget.cssClass,color:defendTarget.color};
                                
                                // console.log('New Dataset '+JSON.stringify(this.dataSet));
                                //then update new attacking position
                                this.onPositionChange();
                            }
                        }
                    }

                    
                }
            }

        }else{
            var tempBlack = {...this.blackAttacksPosition};

            var mainKeys = Object.keys(tempBlack);

            for (let i = 0; i < mainKeys.length; i++) {
                
                var key = mainKeys[i];
                var innerKeys = Object.keys(tempBlack[key]);
                
                if (!isCheckmate) break;

                for (let j = 0; j < innerKeys.length; j++) {

                    var innerKey = innerKeys[j];

                    if (!isCheckmate) break;
                    
                    if(!innerKey.includes('-POSITION')){
                        // console.log(innerKey);
                        var positions = tempBlack[key][innerKey];
                        for (let k = 0; k < positions.length; k++) {
                            var [y,x] = positions[k];

                            if (!isCheckmate) break;

                            //change the position for temporary
                            var defendElementPosition = tempBlack[key][innerKey+'-POSITION'];
                            var defendElement = {...this.dataSet[defendElementPosition[0]][defendElementPosition[1]]};
                            var defendTarget = {...this.dataSet[y][x]};

                            if(defendTarget.current == null || (defendTarget.current != null && defendTarget.color == 'white')){

                                this.dataSet[defendTarget.y][defendTarget.x] = {...defendTarget,type:defendElement.type,current:defendElement.current,cssClass:defendElement.cssClass,color:defendElement.color};
                                this.dataSet[defendElement.y][defendElement.x] = {...defendElement,type:null,current:null,cssClass:null,color:null};
                                //then update new attacking position
                                this.onPositionChange();
                                //if element is king then update king position
                                if(this.dataSet[defendTarget.y][defendTarget.x].type == this.character[0]){

                                    this.blackKing = [defendTarget.y,defendTarget.x];
                                }
                                //then, if king not have a check after this move
                                //then is check mate = false
                                if(this.validatePosition(this.blackKing,color)){
                                    isCheckmate = false;
                                    // console.log('After If '+this.validatePosition(this.blackKing,color));
                                    // console.log(JSON.stringify(this.blackKing)+' '+color);
                                    // console.log('Element '+JSON.stringify(defendElement));
                                    // console.log('Target '+JSON.stringify(defendTarget));
                                    // console.log('Dataset '+JSON.stringify(this.dataSet));
                                    // console.log('White Attack Position '+JSON.stringify(this.whiteAttacksPosition));
                                }
                                if(this.dataSet[defendTarget.y][defendTarget.x].type == this.character[0]){

                                    this.blackKing = [defendElement.y,defendElement.x];
                                }

                                //replace current to old position
                                var defendElement = this.dataSet[defendElementPosition[0]][defendElementPosition[1]];
                                var newDefendTarget = this.dataSet[y][x];
                                
                                this.dataSet[defendElement.y][defendElement.x] = {...defendElement,type:newDefendTarget.type,current:newDefendTarget.current,cssClass:newDefendTarget.cssClass,color:newDefendTarget.color};
                                this.dataSet[defendTarget.y][defendTarget.x] = {...defendTarget,type:defendTarget.type,current:defendTarget.current,cssClass:defendTarget.cssClass,color:defendTarget.color};
                                
                                // console.log('New Dataset '+JSON.stringify(this.dataSet));
                                //then update new attacking position
                                this.onPositionChange();
                            }

                        };
                    }
                }
            }
        }
        

        this.isGameEnd = isCheckmate;
        this.winner = color == 'white' ? 'Black' : 'White';
    }

    //get all attacking position for all character
    onPositionChange(){
        this.whiteAttacksPosition = {};
        this.blackAttacksPosition = {};
        // console.log('validate '+ JSON.stringify(lastChangeElement));
        for (let y = 0; y < this.dataSet.length; y++) {
            for (let x = 0; x < this.dataSet[y].length; x++) {
                
                var element = this.dataSet[y][x];
                if (element.current == null) {
                    continue;
                }

                if(element.type == this.character[5]){
                    var a = getPawnPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                else if(element.type == this.character[4]){
                    var a = getRookPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                else if(element.type == this.character[3]){
                    var a = getBishopPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                else if(element.type == this.character[2]){
                    var a = getKnightPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                else if(element.type == this.character[1]){
                    var a = getQueenPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                else{
                    var a = getKingPosition(element,this.dataSet);
                    if(element.color == 'white'){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[element.type]:{...this.whiteAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                        
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[element.type]:{...this.blackAttacksPosition[element.type],[element.current]:[...a.steps,...a.attacks],[element.current+'-POSITION']:[y,x]}};
                    }
                }
                
            }
        }
    }
    
    //toggle white black moves
    isInervalStart = true;
    toggleMove(){
        var a;
        this.toggler = this.toggler == 'white' ? 'black' : 'white';
        
        if(this.whiteFirstMove && this.blackFirstMove && this.isInervalStart){
            
            var a = setInterval(() => {
                if (!this.isGameEnd) {
                    if((this.whiteMinute <= 0 && this.whiteSecond <= 0) || (this.blackMinute <= 0 && this.blackSecond <= 0)){
                        this.toggler = 'none';
                        if(this.whiteMinute <= 0 && this.whiteSecond <= 0){
    
                            this.addToastMessage('success','Black Win !');
                            this.isGameEnd = true;
                            this.winner = 'Black';
                        }else{
                            this.addToastMessage('success','White Win !');
                            this.isGameEnd = true;
                            this.winner = 'White';
                        }
                        clearInterval(a);
                    }else{
    
                        if(this.toggler == 'white'){
                            if(this.whiteSecond == 0){
                        
                                this.whiteSecond = 59;
                                this.whiteMinute--;
                            }
                            this.whiteSecond--;
                        }else{
                            if(this.blackSecond == 0){
                        
                                this.blackSecond = 59;
                                this.blackMinute--;
                            }
                            this.blackSecond--;
            
                        }
                    }
                }
            }, 1000);
            this.isInervalStart = false;

        }
        
    }

    //perform pawn replacement
    handlePawnReplacement(event){

        var type = event.currentTarget.dataset.value;

        if(this.pawnElement.color == 'white'){
            
            if(this.whiteReBorn[type]){
                this.whiteReBorn = {...this.whiteReBorn,[type]:this.whiteReBorn[type]+1};
            }else{
                this.whiteReBorn = {...this.whiteReBorn,[type]:1};
            }
    
            console.log(JSON.stringify(this.whiteReBorn));
            
            this.dataSet[this.pawnElement.y][this.pawnElement.x] = {...this.pawnElement,type:type,current:type+this.whiteReBorn[type]+'R',cssClass:"fa-solid fa-chess-"+type.toLowerCase()+" player-white"};
            console.log(JSON.stringify(this.dataSet[this.pawnElement.y][this.pawnElement.x]));
            this.pawnElement = null;
            this.isPawnReplaceMent = false;
        }else{
            if(this.blackReBorn[type]){
                this.blackReBorn = {...this.blackReBorn,[type]:this.blackReBorn[type]+1};
            }else{
                this.blackReBorn = {...this.blackReBorn,[type]:1};
            }
    
            console.log(JSON.stringify(this.blackReBorn));
            
            this.dataSet[this.pawnElement.y][this.pawnElement.x] = {...this.pawnElement,type:type,current:type+this.blackReBorn[type]+'R',cssClass:"fa-solid fa-chess-"+type.toLowerCase()+" player-black"};
            console.log(JSON.stringify(this.dataSet[this.pawnElement.y][this.pawnElement.x]));
            this.pawnElement = null;
            this.isPawnReplaceMent = false;
        }

        this.onPositionChange();

    }

    //clear selected element
    clearSelected(){
        this.template.querySelectorAll('.selected')
        .forEach(ele => {
            ele.classList.remove('selected');
        });
    }
    //clear available steps
    clearAvailableSteps(){
        this.template.querySelectorAll('.available')
        .forEach(ele => {
            ele.classList.remove('available');
        });
    }
    //clear available attacks
    clearAvailableAttacks(){
        this.template.querySelectorAll('.available-attack')
        .forEach(ele => {
            ele.classList.remove('available-attack');
        });
    }
    //clear available checks
    clearAvailableChecks(){
        this.template.querySelectorAll('.available-check')
        .forEach(ele => {
            ele.classList.remove('available-check');
        });
    }
    //clear available castle
    clearAvailableCastle(){
        this.template.querySelectorAll('.castle')
        .forEach(ele => {
            ele.classList.remove('castle');
        });
    }

    //for play a sound : mp3
    //pass mp3 audio url
    playAudio(url) {
        new Audio(url).play();
    }

    //for display toast message
    addToastMessage(variant,message){
        this.toastMessage.unshift({'variant':"custom-toast custom-toast-"+variant,'message':message});
        setTimeout(() => {
            this.toastMessage.splice(this.toastMessage.length-1, 1);
        }, 3000);
    }

    handleGameEndView(){
        this.viewGameEnd = true;
    }

    handleAttackAnimation(target){
        console.log(target);
        var left = target.offsetLeft;
        var top = target.offsetTop;

        var flame = this.template.querySelector('.attack-animation-image');
        flame.style.display = 'block';
        flame.style.left = left+'px';
        flame.style.top = top+'px';
        
        var count = 0;
        var speed = 2;
        var a = setInterval(() => {
            if(count >= 100){
                clearInterval(a);
                flame.style.display = 'none';
                flame.style.left = '0px';
                flame.style.top = '0px';
            }
            flame.style.top = (top - count)+'px';
            flame.style.opacity = (100 - count) / 100;
            count += speed;
        }, 5);

    }

    //create initial dataset
    createDataSet(){

        this.columns.forEach((col,j) => {
            var singleRow = [];

            var board_color = col%2 == 0 ? 'background: var(--green);' : 'background: var(--white);';

            this.rows.forEach((row,i) => {

                var type = null;
                var name = null;
                var color = null;
                var cssClass = null;
                var boxCssClass = 'board-column column';

                if (col == 2 || col == 7) {
                    type = this.character[5];
                    name = this.character[5]+(i+1);
                    cssClass = col == 2 ? 'fa-solid fa-chess-pawn player-white' : 'fa-solid fa-chess-pawn player-black';
                    color = col == 2 ? 'white' : 'black';
                    if(col == 2){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[type]:{...this.whiteAttacksPosition[type],[name]:[],[name+'-POSITION']:[j,i]}};
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[type]:{...this.whiteAttacksPosition[type],[name]:[],[name+'-POSITION']:[j,i]}};
                    }
                }
                else if(col == 1 || col == 8){
                    
                    color = col == 1 ? 'white' : 'black';

                    //ROOK
                    if(row == 'A' || row == 'H'){
                        type = this.character[4];
                        name = row == 'A' ? this.character[4]+'1' : this.character[4]+'2';
                        cssClass = col == 1 ? 'fa-solid fa-chess-rook player-white' : 'fa-solid fa-chess-rook player-black';
                    }
                    //KNIGHT
                    else if(row == 'B' || row == 'G'){
                        type = this.character[2];
                        name = row == 'B' ? this.character[2]+'1' : this.character[2]+'2';
                        cssClass = col == 1 ? 'fa-solid fa-chess-knight player-white' : 'fa-solid fa-chess-knight player-black';
                    }
                    //BISHOP
                    else if(row == 'C' || row == 'F'){
                        type = this.character[3];
                        name = row == 'C' ? this.character[3]+'1' : this.character[3]+'2';
                        cssClass = col == 1 ? 'fa-solid fa-chess-bishop player-white' : 'fa-solid fa-chess-bishop player-black';
                    }
                    //QUEEN
                    else if(row == 'D'){
                        type = this.character[1];
                        name = this.character[1];
                        cssClass = col == 1 ? 'fa-solid fa-chess-queen player-white' : 'fa-solid fa-chess-queen player-black';
                    }
                    //KING
                    else{
                        type = this.character[0];
                        name = this.character[0];
                        cssClass = col == 1 ? 'fa-solid fa-chess-king player-white' : 'fa-solid fa-chess-king player-black';
                        if(col == 1){
                            this.whiteKing = [j,i];
                        }else{
                            
                            this.blackKing = [j,i];
                        }
                    }

                    if(col == 1){
                        this.whiteAttacksPosition = {...this.whiteAttacksPosition,[type]:{...this.whiteAttacksPosition[type],[name]:[],[name+'-POSITION']:[j,i]}};
                    }else{
                        this.blackAttacksPosition = {...this.blackAttacksPosition,[type]:{...this.whiteAttacksPosition[type],[name]:[],[name+'-POSITION']:[j,i]}};
                    }
                }

                var a = {
                          y:j,
                          x:i,
                          position:row+col,
                          initial:name,
                          type:type,
                          current:name,
                          cssClass:cssClass,
                          board_color:board_color,
                          color:color,
                          boxCssClass:boxCssClass+j.toString()+i.toString()
                        };
                board_color = board_color == 'background: var(--white);' ? 'background: var(--green);' : 'background: var(--white);';
                singleRow = [...singleRow,a]; 
            });
            this.dataSet = [...this.dataSet,singleRow];
        });
        console.log(JSON.stringify(this.dataSet));
    }
    
}
class Cell
{
    x: number;
    y: number;
    element: any;
    containsObject: boolean;

    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
        this.element = false;
        this.containsObject = false;
    }
}

class Grid
{
    width: number;
    height: number;
    grid: any;

    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
    }

    createGrid()
    {
        let i: number;
        let j: number;
        let grid = new Array(this.height);
        for (i = 0; i < this.height; i++)
        {
            let row: Cell[] = new Array(this.width);
            for (j = 0; j < this.width; j++)
            {
                row[j] = new Cell(j, i);
            }
            grid[i] = row;
        }

        return grid;
    }
}

class Person
{
    currentX: number;
    currentY: number;
    currentCell: Cell;
    homeCell: Cell;
    grid: Grid;
    element: any;

    constructor(grid: Grid,startX: number, startY: number)
    {
        this.grid = grid;
        this.currentX = startX - 1;
        this.currentY = startY - 1;
        this.currentCell = grid.grid[startY-1][startX-1];
        this.homeCell = grid.grid[startY-1][startX-1];
        this.element = false;
    }
}

class Game
{
    timePlay: number;
    canPlay: boolean;
    stopFunction: any;
    person: Person;
    view: View;
    model: Model;
    count: number;
    isCollected: boolean;
    continueGame: boolean;

    constructor(timePlay: number, person: Person, stopFunction: any = false, view:View, model: Model)
    {
        this.timePlay = timePlay;
        this.canPlay = false;
        this.stopFunction = stopFunction;
        this.person = person;
        this.view = view;
        this.model = model;
        this.count = 0;
        this.isCollected = false;
        this.continueGame = false;
    }

    startGame()
    {
        let that: Game = this;
        this.canPlay = true;
        setTimeout(function() {
            that.stopGame(that);
        }, this.timePlay);

        let counter: number = this.timePlay/100;
        let progressBar: HTMLElement = document.querySelector('#progress')?.querySelector('progress') as HTMLElement;
        function progressFill() 
        {
            counter--;
            progressBar.setAttribute('value', `${counter}`);
            if(counter <= 0) {
                console.log('stop timer')
                clearInterval(timer);
            }
        }
        let timer = setInterval(progressFill, 100);
    }

    stopGame(that: Game)
    {
        that.canPlay = false;
        if (that.stopFunction)
        {
            that.stopFunction();
        }
    }
}

class View
{
    start(grid: Grid, person: Person, game: Game, objects: any)
    {
        this.drawGrid(grid);
        person.element = document.getElementById('person') as HTMLElement;
        person.currentCell.element.appendChild(document.getElementById('home'));
        this.setPositionPerson(person, person.currentCell);
        this.drawProgressBar(game.timePlay);
        this.drawObjects(objects);
        game.startGame();
    }

    viewMessage()
    {
        let messageElement = document.querySelector('.message') as HTMLElement;
        messageElement.style.visibility = 'visible';
    }

    hideMessage()
    {
        let messageElement = document.querySelector('.message') as HTMLElement;
        messageElement.style.visibility = 'hidden';
    }

    drawObjects(objects: any)
    {
        objects.forEach((object: Cell) => {
            let carrot = document.createElement('div')
            carrot.classList.add('carrot');
            object.element.appendChild(carrot)
        })
    }

    cleaningCell(objects: any)
    {
        objects.forEach((object: Cell) => {
            object.element.innerHTML = '';
        })
    }

    continueGame(person: Person, game: Game, objects: any)
    {
        this.setPositionPerson(person, person.homeCell);
        this.drawObjects(objects);
        game.startGame();
        console.log('continue');
    }

    setPositionPerson(person: Person, cell: Cell)
    {
        if (cell.containsObject)
        {
            cell.element.innerHTML = '';
        }
        cell.element.appendChild(person.element);
        person.currentX = cell.x;
        person.currentY = cell.y;
        person.currentCell = cell;
    }

    refreshCount(count: number)
    {
        let counter: HTMLElement = document.getElementById('counter') as HTMLElement;
        counter.innerHTML = `${count}`;
    }

    drawProgressBar(timePlay: number)
    {
        let progressBarContainer: HTMLElement| null = document.getElementById('progress') as HTMLElement;
        let progressBar: HTMLElement = document.createElement('progress');
        progressBar.setAttribute('max', `${timePlay/100}`);
        progressBar.setAttribute('value', '0');
        progressBarContainer.appendChild(progressBar);
    }

    drawGrid(grid: Grid)
    {
        let gridContainer: HTMLElement | null = document.getElementById('grid') as HTMLElement;
        let i: number;
        let j: number;
        for (i = 0; i < grid.height; i++)
        {
            let div: HTMLElement = document.createElement('div');
            div.classList.add('row');
            for (j = 0; j < grid.width; j++)
            {
                let cell:HTMLElement = document.createElement('div');
                cell.classList.add('cell');
                grid.grid[i][j].element = cell;
                grid.grid[i][j].htmlX = cell.style.left + 'px';
                grid.grid[i][j].htmlY = cell.style.top + 'px';
                div?.appendChild(cell);
            }
            gridContainer?.appendChild(div);
        }
    }
}

class Model
{
    view: View;
    grid: Grid;
    person: Person;
    game: Game;
    count: number;
    lastRoundCount: number;
    objects: any;
    isCollected: boolean;
    continueGame: boolean;

    constructor(view: View, width: number, height: number, timeRound: number)
    {
        this.view = view;
        this.grid = new Grid(width, height);
        this.person = new Person(this.grid, 3, 5);
        this.game = new Game((timeRound*1000)/2, this.person, this.stopGame, this.view, this);
        this.count = 0;
        this.lastRoundCount = 0;
        this.isCollected = false;
        this.continueGame = false;
    }

    start()
    {
        this.objects = this.calculatePositionObjects();
        this.view.start(this.grid, this.person, this.game, this.objects);
    }

    stopGame()
    {
        console.log('stop game');
        if ((this.person.currentCell != this.person.homeCell) || (this.isCollected == false))
        {
            console.log('lose')
            this.continueGame = false;
            this.count = 0;
            this.view.refreshCount(this.count);
        }
        else
        {
            this.continueGame = true;
            console.log('cool')
        }
        this.view.viewMessage();
    }

    calculatePositionObjects()
    {
        let min: number = 2;
        let max: number = 5;
        let randomCount = this.randomInt(min, max);
        let i: number;
        let objects = new Array(randomCount);
        for (i = 0; i < randomCount; i++)
        {
            let y: number = this.randomInt(0, this.grid.height - 1);
            let x: number = this.randomInt(0, this.grid.width - 1);
            if (this.person.homeCell == this.grid.grid[y][x])
            {
                i--;
                continue;
            }
            this.grid.grid[y][x].containsObject = true;
            objects[i] = this.grid.grid[y][x];
        }

        return objects;
    }

    randomInt(min: number, max: number)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkContains(cell: Cell)
    {
        if (cell.containsObject)
        {   
            this.game.isCollected = true;
            this.count += 1;
            this.view.refreshCount(this.count);
            cell.containsObject = false;
            let i: number;
            let index: number;
            for (i = 0; i < this.objects.length; i++)
            {
                if (cell == this.objects[i])
                {
                    index = i;
                    break;
                }
            }
        }
    }

    cleaningCell()
    {
        this.objects.forEach((object: Cell) => {
            object.containsObject = false;
        });
    }

    definitionKey(code: string)
    {
        if (this.game.canPlay)
        {
            switch (code)
            {
                case 'KeyW': 
                {
                    if ((this.person.currentY - 1) >= 0)
                    {
                        let cell: Cell = this.grid.grid[this.person.currentY-1][this.person.currentX];
                        this.view.setPositionPerson(this.person, cell);
                        this.checkContains(cell);
                    }
                    break;
                }
                case 'KeyS': 
                {
                    if ((this.person.currentY + 1) <= (this.grid.height - 1))
                    {
                        let cell: Cell = this.grid.grid[this.person.currentY+1][this.person.currentX];
                        this.view.setPositionPerson(this.person, cell);
                        this.checkContains(cell);
                    }
                    break;
                }
                case 'KeyA': 
                {
                    if ((this.person.currentX - 1) >= 0)
                    {
                        let cell: Cell = this.grid.grid[this.person.currentY][this.person.currentX-1];
                        this.view.setPositionPerson(this.person, cell);
                        this.checkContains(cell);
                    }
                    break;
                }
                case 'KeyD': 
                {
                    if ((this.person.currentX + 1) <= (this.grid.width - 1))
                    {
                        let cell: Cell = this.grid.grid[this.person.currentY][this.person.currentX+1];
                        this.view.setPositionPerson(this.person, cell);
                        this.checkContains(cell);
                    }
                    break;
                }
            }
        }
        else
        {
            if (code == 'Enter')
            {
                this.view.hideMessage();
                this.game.isCollected = false;
                if (!this.game.continueGame)
                {
                    this.count = 0;
                }
                if (this.objects.length > 0)
                {
                    this.cleaningCell();
                    this.view.cleaningCell(this.objects);
                }
                this.objects = this.calculatePositionObjects();
                this.view.continueGame(this.person, this.game, this.objects);
            }
        }
    }
}

class Controller
{
    model: Model;
    
    constructor(model: Model)
    {
        this.model = model;
    }

    start()
    {
        this.model.start();
        this.auditionEvent();
    }

    auditionEvent()
    {
        document.onkeydown = (event) => {
            this.model.definitionKey(event.code);
        }
    }
}
let start: boolean = false;

let messageElement = document.querySelector('#start-message') as HTMLElement;
messageElement.style.visibility = 'visible';

let mainElement = document.querySelector('.main') as HTMLElement;
mainElement.style.visibility = 'hidden';

document.onkeydown = (event) => {
    if (!start)
    {
        if (event.code == 'Enter')
        {
            let width = prompt('Введите ширину поля >= 5', '');
            while (Number(width) < 5)
            {
                width = prompt('Введите ширину поля >= 5', '')
            }
            let height = prompt('Введите высоту поля >= 5', '');
            while (Number(height) < 5)
            {
                height = prompt('Введите высоту поля >= 5', '')
            }
            let timeRound = prompt('Введите время раунда >= 5 секунд', '');
            while (Number(timeRound) < 5)
            {
                timeRound = prompt('Введите время раунда >= 5', '')
            }
            mainElement.style.visibility = 'visible';
            const view: View = new View();
            const model: Model = new Model(view, Number(width), Number(height), Number(timeRound));
            const controller: Controller = new Controller(model);
            controller.start();
            messageElement.style.visibility = 'hidden';
        }
    }
}





//Store user input for future use
var keys=[];
keyPressed=function(){keys[keyCode] = true;};
keyReleased=function(){keys[keyCode] = false;};

//Js keycodes for the arrow buttons
var LEFT_ARROW = 37;
var RIGHT_ARROW = 39;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

//Vector constructor including the math functions needed for raytracing
var Vector = function(x ,y){
    //X and Y components of the vector
    this.x = x;
    this.y = y;

    //Convert the vector to a unit vector with the same direction
    this.normalize = function(){
        var angle = Math.atan2(this.y, this.x);
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }

    //Add two vectors or a vector and a scalar
    this.add = function(other){
        if(!other.x){
            //Scalar
            this.x += other;
            this.y += other;
        }else{
            //Vector
            this.x += other.x;
            this.y += other.y;
        }
    }

    //Subtract two vectors or a vector and a scalar
    this.subtract = function(other){
        if(!other.x){
            //Scalar
            this.x -= other;
            this.y -= other;
        }else{
            //Vector
            this.x -= other.x;
            this.y -= other.y;
        }
    }

    //Multiply two vectors or a vector and a scalar
    this.mult = function(other){
        if(!other.x){
            //Scalar
            this.x *= other;
            this.y *= other;
        }else{
            //Vector
            this.x *= other.x;
            this.y *= other.y;
        }
    }

    //Get the angle of the vector in radians
    this.getAngle = function(){
        return Math.atan2(this.y, this.x);
    }

    //Get the length (magnitude) of the vector
    this.length = function(){
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}

//Ray constructor. A ray is just two vectors: a position vector and a direction vector
var Ray = function(origin, direction){
    this.origin = origin;
    this.direction = direction;
}

//Globally accessable object for storing all the game data
var gameMap = {
    //String representation of the game world
    data : [
        "11      22          ",
        "1L      L2     1 1 1",
        "    66          2 2 ",
        "               3 3 3",
        "  5    5        4 4 ",
        "  5  S 5       5 5 5",
        "                6 6 ",
        "    66         1 1 1",
        "4L      L3      1 1 ",
        "44      33     1 1 1",
    ],

    //Percentage of the smallest screen dimention for the minimap to be
    miniMapSize : 10,

    //Setup the game. Set the player to spawn and add game colors to the colors object for later lookup
    //Note: you can't define this.colors explicitly in the object because P5 objects are only availible in the setup or draw functions
    setup : function(){
        //Loop through the map data looking for the spawn point character
        for(var y = 0; y < this.data.length; y++){
            for(var x = 0; x < this.data[y].length; x++){
                if(this.data[y][x] === "S"){
                    //Move the player to the spawn point
                    player.pos.x = x;
                    player.pos.y = y;
                }
            }
        }

        //Wall colors + floor gradient colors
        this.colors = {
            "1" : color(230, 230, 230),
            "2" : color(255, 0, 0),
            "3" : color(0, 255, 0),
            "4" : color(0, 0, 255),
            "5" : color(0, 255, 255),
            "6" : color(255, 255, 0),
            floorStart : color(255, 255, 255),
            floorEnd : color(150, 150, 150),
        };
    },

    //Render the minimap
    drawMiniMap : function(){
        //Unit size for the mini map, based on the mini map size and size of the map
        var blockSize = Math.ceil((width / this.miniMapSize) / (this.data.length > this.data[0].length ? this.data.length : this.data[0].length));

        //Slightly transparent background for the map
        fill(0, 0, 0, 50);
        rect(0, 0, this.data[0].length * blockSize, this.data.length * blockSize);

        //Loop through the map and draw walls accordingly
        for(var y = 0; y < this.data.length; y++){
            for(var x = 0; x < this.data[y].length; x++){
                //If the map space is a number
                if(parseInt(this.data[y][x])){
                    //Get the relevant color from the color object, and set that as the fill
                    fill(this.colors[this.data[y][x]]);
                }else{
                    //If the map space isn't a number, then it isn't a wall and we don't draw it
                    continue;
                }
                
                //Draw the wall as a rectangle
                rect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }

        //Draw the player
        push();
            //Push the matrix. This makes is so only the code within push() and pop() is effected by the matrix transformations performed (translate, rotate)
            fill(255, 0 , 0);
            //Draw the rectangles from the center, better for rotation
            rectMode(CENTER);
            //Move the matrix to players location relative to minimap scale
            translate(player.pos.x * blockSize, player.pos.y * blockSize);
            //Rotatie the matrix to the players direction
            rotate(player.direction.getAngle());
            //Draw a rectangle at the matrix origin (players minimap position due to the translate)
            rect(0, 0, blockSize / 2, blockSize / 2);
            //Draw a direction indicator
            strokeWeight(2);
            stroke(255, 0, 0);
            line(0, 0, blockSize / 2, 0);
            //Reset drawing settings
            noStroke(); 
            rectMode(CORNER);
            //Pop the matrix
        pop();
    },

    //Find walls hit by ray cast into the virtual space
    getRayCollision : function(ray){
        //Note: This algorithm is my implimentation of a digital differential analyzer (DDA). A DDA calculates the intersections of a line and a grid. It is commonly used in graphics the determine which pixels to turn on, because pixels are on a grid
        //I'm using it to find where the rays hit walls, because the walls are generated on a grid

        //Ray direction deltas
        var dx = ray.direction.x;
        var dy = ray.direction.y;

        //Horizontal offsets
        var xa;
        var ya;

        //Vertical offsets
        var xb;
        var yb;

        //First grid intersections
        var hFirstHit = new Vector(0, 0); //First intersection with a whole number x value
        var vFirstHit = new Vector(0, 0); //First intersection with a whole number y value

        //Angle of the ray
        var angle = ray.direction.getAngle();

        if(dx > 0){ //Ray is moving right
            hFirstHit.x = Math.ceil(ray.origin.x) - ray.origin.x;
            var px = hFirstHit.x;
            hFirstHit.y = Math.tan(angle) * px;
            xa = 1;
            ya = Math.tan(angle) * xa;
        }else if(dx < 0){ //Ray is moving left
            hFirstHit.x = Math.floor(ray.origin.x) - ray.origin.x;
            var px = hFirstHit.x;
            hFirstHit.y = Math.tan(angle) * px;
            xa = -1;
            ya = Math.tan(angle) * xa;
        }

        if(dy > 0){ //Ray is moving down (Coordinate system in P5 has y increasing as you go down the screen, and the origin in the top left)
            vFirstHit.y = Math.ceil(ray.origin.y) - ray.origin.y;
            var py = vFirstHit.y;
            vFirstHit.x = py / Math.tan(angle);
            yb = 1;
            xb = yb / Math.tan(angle);
        }else{ //Ray is moving up
            vFirstHit.y = Math.floor(ray.origin.y) - ray.origin.y;
            var py = vFirstHit.y;
            vFirstHit.x = py / Math.tan(angle);
            yb = -1;
            xb = yb / Math.tan(angle);
        }

        var intersection = hFirstHit;
        var hOffset = new Vector(xa, ya);
        var vOffset = new Vector(xb, yb);
        var hit = null;

        var blockSize = Math.ceil((width / this.miniMapSize) / (this.data.length > this.data[0].length ? this.data.length : this.data[0].length));
        strokeWeight(5);
        stroke(0, 255, 0);

        //Horizontal intersections
        if(Math.floor(ray.origin.x) === Math.floor(ray.origin.x + ray.direction.x)){ //The ray never crosses a horizontal gridline, don't need to check
            while(intersection.length() < ray.direction.length()){ //While we're still checking within the rendering range
                var mapX = xa > 0 ? player.pos.x + intersection.x : player.pos.x + intersection.x - 1; //Find the x coord of grid box hit
                mapX = Math.round(mapX); //Round so to not throw an error when referencing the array
                var mapY = Math.floor(player.pos.y + intersection.y); //Find the y coord of grid box hit
                if(mapY >= 0 && mapY < this.data.length){ //If the grid box is within the y range of the array
                    if(mapX >= 0 && mapX < this.data[mapY].length){ //If the grid box is within the x range of the array
                        var char = this.data[mapY][mapX]; //Character found at collision point in the map
                        if(parseInt(char)){ //If its a number then its a wall
                            hit = {
                                char: char,
                                distance: intersection.length(),
                                vector: intersection,
                                x: xa,
                                y: ya
                            };
                            break;
                        }
                    }
                }
                intersection.add(hOffset);
            }
        }

        intersection = vFirstHit;

        //Vertical intersections
        while(intersection.length() < ray.direction.length()){
            if(hit != null){
                if(intersection.length() > hit.distance){
                    break;
                }
            }
            var mapX = Math.floor(player.pos.x + intersection.x);
            var mapY = yb > 0 ? player.pos.y + intersection.y : player.pos.y + intersection.y - 1;
            mapY = Math.round(mapY);
            if(mapY >= 0 && mapY < this.data.length){
                if(mapX >= 0 && mapX < this.data[mapY].length){
                    var char = this.data[mapY][mapX];
                    if(parseInt(char)){
                        hit = {
                            char: char,
                            distance: intersection.length(),
                            vector: intersection,
                            x: xb,
                            y: yb
                        };
                        break;
                    }
                }
            }
            intersection.add(vOffset);
        }

        if(hit != null){
            //point((player.pos.x + hit.vector.x) * blockSize, (player.pos.y + hit.vector.y) * blockSize);
        }

        noStroke();

        return hit;
    }
}

var player = {
    pos : new Vector(0, 0),
    size : 0.1,
    direction : new Vector(1,1),
    speed : 0,
    maxSpeed : 0.05,
    turnSpeed : Math.PI / 100,

    screenWidth : 320,
    screenHeight : 240,
    focalLength : 560,
    fov : Math.PI / 3,
    renderRange : 20,
    scale : 2,

    colorMultiplier : 10,

    update : function(){
        this.move();
        this.render();
    },

    move : function(){
        this.direction.normalize();
        this.direction.mult(this.maxSpeed);

        var angle = this.direction.getAngle();

        if(keys[RIGHT_ARROW]){
            angle += this.turnSpeed;
        }

        if(keys[LEFT_ARROW]){
            angle -= this.turnSpeed;
        }

        this.direction = new Vector(Math.cos(angle) * this.direction.length(), Math.sin(angle) * this.direction.length());

        if(keys[UP_ARROW]){
            this.speed = 1;
        }else if(keys[DOWN_ARROW]){
            this.speed = -1;
        }else{
            this.speed = 0;
        }

        this.pos.x += this.direction.x * this.speed;
        this.collision(this.direction.x * this.speed, 0);
        this.pos.y += this.direction.y * this.speed;
        this.collision(0, this.direction.y * this.speed);
    },

    render : function(){
        for(var y = 0; y < this.screenHeight / 2; y += this.scale * 2){
            
        }

        for(var y = this.screenHeight * 0.75; y > this.screenHeight / 2; y -= this.scale * 2){
            var color = lerpColor(gameMap.colors.floorEnd, gameMap.colors.floorStart, (y - this.screenHeight / 2) / (this.screenHeight * 0.25));
            fill(color);
            rect(0, Math.round(y), this.screenWidth, -this.scale * 2);
        }

        for(var x = 0; x < this.screenWidth; x += this.scale){
            var relativeX = -(x - this.screenWidth / 2);
            var rayDirection = new Vector(relativeX, this.focalLength);
            var rayAngle = rayDirection.getAngle() + this.direction.getAngle() - Math.PI / 2;
            rayDirection = new Vector(Math.cos(rayAngle), Math.sin(rayAngle));
            rayDirection.mult(this.renderRange);
            var ray = new Ray(this.pos, rayDirection);
            var rayCollision = gameMap.getRayCollision(ray);
            if(rayCollision === null){
                continue;
            }
            var beta = this.direction.getAngle() - rayCollision.vector.getAngle(); //angle of hit relative to viewing angle
            var distance = rayCollision.distance * Math.cos(beta); //Distance adjusted to remove fisheye effect

            var wallHeight = (1 / distance) * this.focalLength;

            noStroke();
            var color = this.getColor(gameMap.colors[rayCollision.char], distance, rayCollision.x);
            fill(color);
            rect(x, this.screenHeight / 2 - wallHeight / 2, this.scale, wallHeight);
        }
    },

    getColor : function(c, distance, dx){
        var shadow;
        if(Math.abs(dx) === 1){
            if(dx > 0){
                shadow = 1;
            }else{
                shadow = 0.7;
            }
        }else{
            shadow = 0.85;
        }
        return color(Math.min(c.levels[0] / distance * this.colorMultiplier * shadow, c.levels[0] * shadow), Math.min(c.levels[1] / distance * this.colorMultiplier * shadow, c.levels[1] * shadow), Math.min(c.levels[2] / distance * this.colorMultiplier * shadow, c.levels[2] * shadow));
    },

    collision : function(dx, dy){
        for(var y = 0; y < gameMap.data.length; y++){
            for(var x = 0; x < gameMap.data[y].length; x++){
                if(!parseInt(gameMap.data[y][x])){
                    continue;
                }
                if(this.pos.x > x - this.size && this.pos.x < x + 1 + this.size && this.pos.y > y -this.size && this.pos.y < y + 1 + this.size){
                    if(dx > 0){
                        this.pos.x = x - this.size;
                    }else if(dx < 0){
                        this.pos.x = x + 1 + this.size;
                    }

                    if(dy > 0){
                        this.pos.y = y - this.size;
                    }else if(dy < 0){
                        this.pos.y = y + 1 + this.size;
                    }
                }
            }
        }
    },

    setScreen : function(width, height){
        this.screenWidth = width;
        this.screenHeight = height;
        this.focalLength = (this.screenWidth / 2) / Math.tan(this.fov / 2);
    }
}

function setup(){
    createCanvas(document.body.clientWidth, window.innerHeight);
    player.setScreen(document.body.clientWidth, window.innerHeight);
    gameMap.setup();
}

function windowResized() { 
    resizeCanvas(document.body.clientWidth, window.innerHeight); 
    player.setScreen(document.body.clientWidth, window.innerHeight);
}

function draw(){
    background(255, 255 ,255);
    player.update();
    gameMap.drawMiniMap();
}
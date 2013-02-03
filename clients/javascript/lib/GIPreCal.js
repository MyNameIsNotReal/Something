//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
//
// GI - Our library namespace
//
//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
var GI = function() {
    
    //=========================================================================
    //
    // GI::Predicted Calculation Object
    //
    // A object holding a mouse position values
    //
    //=========================================================================
    function predictCalObject(x, y, timestamp){
       this.x = x;
       this.y = y;
       this.timestamp = timestamp;
    }
    
    
    //=========================================================================
    //
    // GI::PreCal
    //
    // A object with function to prediectly calucaultion the mouse position
    //
    //Constructor:
    //Init all data 
    //=========================================================================
    function PreCal() {
        
        this.queue = [];
        this.xRate = 0;
        this.yRate = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.x = 0;
        this.y = 0;
        this.lastRequestTime = 0;
        this.currentRequestTime = 0;
        this.currentQueueLength = 0;
        this.lastQueueLength = 0;
     }
    //-------------------------------------------------------------------------
    // GI::PreCal::fill
    // Fill mouse position data array
    //-------------------------------------------------------------------------
    PreCal.prototype.fill = function(x, y) {
        var currentMouse = new predictCalObject(x,y, new Date().getTime());
        this.queue.push(currentMouse); 
    }
    //-------------------------------------------------------------------------
    // GI::PreCal:getX
    // Calculate the next x
    //-------------------------------------------------------------------------
    PreCal.prototype.getXY = function() {
      this.lastRequestTime = this.currentRequestTime;
      this.currentRequestTime = new Date().getTime();
      var XY;
      if(this.queue.length  >= 2 ){
            this.lastQueueLength = this.currentQueueLength;
            this.currentQueueLength = this.queue.length;
            var oldMouse = this.queue[0];
            var newMouse = this.queue[1];
            var directionX = new Number(newMouse.x - oldMouse.x);
            var directionY = new Number(newMouse.y - oldMouse.y);
            var latency =new Number( newMouse.timestamp - oldMouse.timestamp);                     
            this.xRate = directionX/latency;
            this.yRate = directionY/latency; 
            this.x = new Number(this.x) + new Number(this.xRate * ( this.currentRequestTime - this.lastRequestTime));
            this.y = new Number(this.y) + new Number(this.yRate * ( this.currentRequestTime - this.lastRequestTime));
            //Current Mouse arrive expected position. shift queue and reset this.x this.y
            if((directionX > 0 &&  this.x >= newMouse.x ) || (directionX < 0 && this.x <= newMouse.x) || (directionY > 0 &&  this.y >= newMouse.y ) || (directionY < 0 && this.y <= newMouse.y) || (directionX == 0 && directionY == 0)){     
                this.queue.shift();
                this.x = newMouse.x;
                this.y = newMouse.y;
            }  
        }
        XY = {
              'x': this.x,
              'y': this.y
            };
         return XY;
     }   
    
    return {
        PreCal : PreCal
    };
    
}();
// END: Namespace GI
//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
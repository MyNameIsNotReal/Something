//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
//
// GI - Our library namespace
//
//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
var GI = function() {
    
    //=========================================================================
    //
    // GI::Predict
    //
    // A object with function to prediect next mouse position
    //
    //Constructor:
    //Init all data and passed in the calculation precision 
    //=========================================================================
    function Predict() {
        
        this.x1 = 0;
        this.x2 = 0;
        this.xRate = null;
        this.y1 = 0;
        this.y2 = 0;
        this.yRate = null;
        this.reFill = true;
        this.latency = 0;
        this.lastTime = 0;
        this.currentTime = 0;
     }
    //-------------------------------------------------------------------------
    // GI::Predict::fill
    // Fill x1, x2, y1,y2 data
    //-------------------------------------------------------------------------
    Predict.prototype.fill = function(x, y, stop) {
       //   console.log(' x = '+x+', y = ' + y);
          this.x1 = this.x2;
          this.y1 = this.y2;
          this.x2 = x;
          this.y2 = y;
          this.lastTime = this.currentTime;
          this.currentTime = new Date().getTime();
          this.latency = this.currentTime - this.lastTime;
          if(stop != undefined && stop === true){
            this.xRate = 0;
            this.yRate = 0;
          }
          else{
            this.xRate = (this.x2 - this.x1)/this.latency;
            this.yRate = (this.y2 - this.y1)/this.latency;
          }
         // console.log('x1 = ' + this.x1 + ', y1 = ' + this.y1+ ', x2 = ' + this.x2+ ', y2 = ' + this.y2+ ', xRate = ' + this.xRate + ', yRate = ' + this.yRate);
    }
    //-------------------------------------------------------------------------
    // GI::Predict:getX
    // Calculate the next x
    //-------------------------------------------------------------------------
    Predict.prototype.getXY = function() {
       var time = new Date().getTime(); 
       var x = parseInt(this.x2) + parseInt(this.xRate * ( time - this.currentTime));
       var y = parseInt(this.y2) + parseInt(this.yRate * ( time - this.currentTime));
       var XY = {
         'x': x,
         'y': y
      };

     //  console.log('predict x ' + x + ' predict y ' + y);
       return XY;
    }
    
   
    
    return {
        Predict : Predict
    };
    
}();
// END: Namespace GI
//#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#
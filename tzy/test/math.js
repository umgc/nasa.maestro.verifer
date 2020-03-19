
export default class math {
	constructor() { 
	  
	}
	
	//block method
  add(x, y) {
    return x + y;
  }
  
  /* 
  async/await mode in ES2017
  */
  
  //unblock: asyncrinze function
  async async_add(x, y){
      return x+y;
  }
  
  //async_add2 = async_add
  async async_add2(x, y){
     return Promise.resolve(x + y);
  }
  
  async async_add3(x, y){
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve(x+y);
      }, 2000)
    });
  }
  
  async async_add4(x, y){
    const sth = await this.async_add3(x*10, y);
    return sth;
  }//
  
}



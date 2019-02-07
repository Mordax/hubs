AFRAME.registerSystem("ticker", {
  init() {
    this.promises = [];
    this.nextPromises = [];
  },

  tick() {
    for (let i = 0; i < this.promises.length; i++) {
      this.promises[i]();
    }
    this.promises.length = 0;
    for (let i = 0; i < this.nextPromises.length; i++) {
      this.promises.push(this.nextPromises[i]);
    }
    this.nextPromises.length = 0;
  },

  nextTick() {
    return new Promise(resolve => {
      this.nextPromises.push(resolve);
    });
  }
});

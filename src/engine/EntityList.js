export class EntityList {
  entitiesList = [];
  
  // Performance tracking
  updateCount = 0;
  drawCount = 0;
  lastPerformanceLog = 0;

  add = (EntityClass, ...args) => {
    this.entitiesList.push(new EntityClass(...args, this));
  };

  remove = (entity) => {
    const index = this.entitiesList.indexOf(entity);
    if (index !== -1) {
      this.entitiesList.splice(index, 1);
    }
  };

  update = (time, camera) => {
    this.updateCount++;
    
    // Use for...of for better performance than forEach
    for (const entity of this.entitiesList) {
      if (entity && entity.update) {
        entity.update(time, camera);
      }
    }
    
    // Log performance every 1000 updates
    if (this.updateCount % 1000 === 0) {
      this.logPerformance();
    }
  };

  draw = (context, camera) => {
    this.drawCount++;
    
    // Simple drawing loop
    for (const entity of this.entitiesList) {
      if (entity && entity.draw) {
        entity.draw(context, camera);
      }
    }
  };

  forEach(callback) {
    // Use for...of for better performance
    for (const entity of this.entitiesList) {
      callback(entity);
    }
  }

  // Performance monitoring
  logPerformance() {
    const now = performance.now();
    if (now - this.lastPerformanceLog > 5000) { // Log every 5 seconds
      console.log(`Entity Performance: ${this.entitiesList.length} entities, ${this.updateCount} updates, ${this.drawCount} draws`);
      this.updateCount = 0;
      this.drawCount = 0;
      this.lastPerformanceLog = now;
    }
  }

  // Get entity count
  getCount() {
    return this.entitiesList.length;
  }
}

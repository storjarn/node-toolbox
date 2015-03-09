class Test {
    constructor() {
    }
}
Test.prototype.test = true

console.assert(new Test().test)
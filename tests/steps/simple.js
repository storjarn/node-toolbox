module.exports = function(){
  this.Given(/^I visit TODOMVC$/,function(){
    this.driver.get('http://todomvc.com/architecture-examples/backbone/')
  });

  this.When(/^I enter \"([^\"]*)\"$/, function(value){
    new this.Widget({
      root: "#new-todo"
    }).sendKeys(value,'\uE007');
  });

  this.Then(/^I should see \"([^\"]*)\"$/, function(expected){
    var List = this.Widget.List.extend({
      root: "#todo-list",
      childSelector: "li"
    })

    return new List().readAt(0).should.eventually.eql(expected);
  })

  this.Given(/^I visit Google$/,function(){
    this.driver.get('http://www.google.com/')
  });

  this.When(/^I search for \"([^\"]*)\"$/, function(value){
    new this.Widget({
      root: "#gbqfq"
    }).sendKeys(value,'\uE007');
  });

  this.Then(/^I should see the entry \"([^\"]*)\"$/, function(expected){
    var List = this.Widget.List.extend({
      root: "#rso",
      childSelector: "li",
      isCompleted: function(index) {
          this.at(index).then(function(el){
              return el.getText().indexOf(expected) > -1
          })
        }
    })

    var list = new List()

    return list.readAt({index: 0, selector: 'h3.r a'}).should.eventually.eql(expected);
  })
}

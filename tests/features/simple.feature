Feature: Simple Feature

  Scenario: Entering Information
    Given I visit TODOMVC
    When I enter "dogecoins"
    Then I should see "dogecoins"

  Scenario: Entering a Search
    Given I visit Google
    When I search for "h"
    Then I should see the entry "Hydrogen - Wikipedia, the free encyclopedia"

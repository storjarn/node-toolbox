#!/usr/bin/env ruby

require 'restclient'

config = {
    :host => "https://tangogroup.jira.com",
    :apiVersion => "2",
    :projectName => "POLYB",
    :startAt => "0",
    :maxResults => "2000"
}

jqlSearchString = config[:host] + "/rest/api/" + config[:apiVersion] + "/search?jql=project%20%3D%20" + config[:projectName] + "&maxResults=" + config[:maxResults] + "&startAt=" + config[:startAt]

puts RestClient::Request.new(
    :method => :get,
    :url => jqlSearchString,
    :user => ENV["JIRAUSER"],
    :password => ENV["JIRAPASS"],
    :headers => {
        :accept => :json,
        :content_type => :json
    }
  ).execute

# puts %x[ ls && cat * ]

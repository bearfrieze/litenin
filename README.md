# Litenin

Litenin is a very light and shockingly fast feed reader.

## Motivation

I grew really frustrated with Feedly's very long load times (I frequently waited 10 seconds or more to read the news). I tried out a couple of readers/aggregators for OSX, but I found it very inconvinient jumping back and forth between the reader and the browser (I don't like browsing in my reader).

## Goal

The goal of Litenin is to create a very light and shockingly fast feed reader.

- All features are carefully chosen and should be essential to the average user. 
- Speed is of high priority. Ideally solutions should be both simple and performant, but sometimes faster solutions might be chosen at the expense of simplicity.

## Concept

Litenin is a thin client written in JavaScript that runs in the users browser. This client is responsible for loading feeds and displaying them to the user. Feeds are provided by [Nimbus](https://github.com/bearfrieze/nimbus) through [Static](https://github.com/bearfrieze/static). Persistence is achieved with [localStorage](http://diveintohtml5.info/storage.html).

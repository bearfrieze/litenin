# Litenin

Litenin is a light and shockingly fast feed reader. I've [stopped working on it](https://github.com/bearfrieze/litenin/issues/14) and shut down the server. Feel free to boot up your own copy.

## Motivation

When I started developing Litenin I had grown really frustrated with Feedly's very long load times (I frequently waited 10 seconds or more to read the news, they have improved since then). I tried out a couple of readers/aggregators for OSX, but I found it very inconvinient jumping back and forth between the reader and the browser (I don't like browsing in my reader).

## Goal

The goal of Litenin is to create a light and shockingly fast feed reader.

- All features are carefully chosen and should be essential to the majority of users.
- Speed is of high priority. Ideally solution used in Litenin are both simple and performant, but sometimes faster solutions will be chosen at the expense of simplicity.

## Concept

Litenin is a thin client written in JavaScript that runs in the users browser. This client is responsible for loading feeds and displaying them to the user. Feeds are provided by [Nimbus](https://github.com/bearfrieze/nimbus). Persistence is achieved with [localStorage](http://diveintohtml5.info/storage.html).

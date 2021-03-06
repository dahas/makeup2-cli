# CLI for the 'makeUp' framework

## What is it?

The CLI is part of the **makeUp** framework. It makes no sense using it without the framework! 

**makeUp** is work in progress. If you are interested in what it is about, you can find the framework here: https://github.com/dahas/makeup2

## Installation

The CLI must be installed globally:

```
$ npm i -g makeup-cli
```

## Usage example

```
$ makeup -v
```

Find a list below with all available arguments.

Argument|Short|Description
---|---|---
<code>--install</code> | <code>-i</code> | Download framework and install dependencies
<code>--create-module</code> | <code>-m</code> | Create a custom module
<code>--create-service</code> | <code>-s</code> | Create a service
<code>--sass</code> | <code>-w</code> | Start SASS watcher
<code>--serve</code> | <code>-p</code> | Start SASS watcher and launch PHP webserver
<code>--version</code> | <code>-v</code> | Get the version number

## Author 
Martin J. Wolf

## License
ISC
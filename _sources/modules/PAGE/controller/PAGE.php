<?php

use makeup\lib\Module;
// use makeup\lib\RQ;
// use makeup\lib\Config;
// use makeup\lib\Tools;
// use makeup\lib\Session;
// use makeup\lib\Cookie;
// use makeup\lib\Lang;


class CCCC extends Module
{
    public function __construct()
    {
        parent::__construct();
    }


    protected function build() : string
    {
        $m = [];
        $s = [];

        $m['##MODULE##'] = $this->modName;

        return $this->getTemplate()->parse($m, $s);
    }


    /**
     * A task is simply a method that is triggered with a request parameter. Like so: "?task=doSomething"
	 */
	public function doSomething()
	{ 
        // Do something ...
        return;
	}

}

<?php

use makeup\lib\Module;


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

        $html = $this->getTemplate("FFFF.html")->parse($m, $s);
        return $this->render($html);
    }


    /**
     * A task is simply a method that is triggered with a request parameter.
     * Like so: "?mod=FFFF&task=doSomething". Or rewritten: "/FFFF/doSomething/"
	 */
	public function doSomething()
	{ 
        // Do something ...
        return;
	}

}

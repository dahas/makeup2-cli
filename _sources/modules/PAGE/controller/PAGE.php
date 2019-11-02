<?php

use makeup\lib\Module;
// use makeup\lib\RQ;
// use makeup\lib\Config;
// use makeup\lib\Tools;
// use makeup\lib\Session;
// use makeup\lib\Cookie;
// use makeup\lib\Lang;


class XXXX extends Module
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * This function prepares the module for rendering.
     *
     * @param string $modName
     * @return string
     */
    protected function build() : string
    {
        $m = [];
        $s = [];

        $m['##MODULE##'] = $this->modName;

        return $this->getTemplate()->parse($m, $s);
    }


    /**
     * This is an example of a task
	 */
	public function example()
	{
        return;
	}

}

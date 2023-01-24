<?php

use makeUp\lib\Template;
use makeUp\src\Lang;
use makeUp\src\Module;
use makeUp\src\Request;


class CCCC extends Module {

    protected function build(Request $request) : string
    {
        $data = $request->getParameters(); // Use this method to retrieve sanitized GET and POST data.

        $m["[[MODULE]]"] = $request->getModule();
        $m["[[MOD_CREATED_SUCCESS]]"] = Lang::get("module_created_success");
        $m["[[CONTINUE_LEARNING]]"] = Lang::get("continue_learning");

        $html = Template::load("CCCC")->parse($m);
        return $this->render($html);
    }

}

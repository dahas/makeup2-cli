<?php

use makeUp\lib\Lang;
use makeUp\lib\Module;
// use makeUp\lib\attributes\Inject;


class CCCC extends Module
{
    // #[Inject('Sampledata')]
    // protected $SampleService;


    protected function build() : string
    {
        $params = Module::getParameters(); // Use this method to retrieve sanitized GET and POST data.

        $m["[[MODULE]]"] = $this->modName;

        $m["[[MOD_CREATED_SUCCESS]]"] = Lang::get("module_created_success");
        $m["[[CONTINUE_LEARNING]]"] = Lang::get("continue_learning");

        $s["{{SAMPLE_DATA}}"] = "";
        
        /******************************************************************************************
         | The below section requires a MySQL database. Before uncommenting please make sure you  |
         | have MySQL installed and the server is running. Then import the file 'sampledata.sql'  |
         | located in the 'makeUp' folder. Also enter the necessary infos in the database section |
         | of 'App.ini' and uncomment the Service above.                                          | 
         *****************************************************************************************/

        // $slice = $this->getTemplate()->getSlice("{{SAMPLE_DATA}}");

        // $this->SampleService->read();

        // if($this->SampleService->count() > 0) {
        //     $row = $slice->getSlice("{{ROW}}");

        //     $sm["[[HEADER]]"] = "Sample Data";
        //     $ss["{{ROW}}"] = "";

        //     while ($Data = $this->SampleService->next()) {
        //         $ssm = [];
        //         $ssm["[[UID]]"] = $Data->getProperty("uid");
        //         $ssm["[[NAME]]"] = $Data->getProperty("name");
        //         $ssm["[[CITY]]"] = $Data->getProperty("city");
        //         $ssm["[[COUNTRY]]"] = $Data->getProperty("country");
        //         $ss["{{ROW}}"] .= $row->parse($ssm);
        //     }

        //     $s["{{SAMPLE_DATA}}"] .= $slice->parse($sm, $ss);
        // }

        $html = $this->getTemplate("FFFF.html")->parse($m, $s);
        return $this->render($html);
    }


    /**
     * A task is simply a method that is triggered with a request parameter.
     * Like so: "/FFFF?task=doSomething".
	 */
	public function doSomething()
	{ 
        // Do something ...
	}

}

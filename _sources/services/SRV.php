<?php

namespace makeup\services;

use makeup\lib\Service;
use makeup\lib\ServiceItem;


/**
 * Collection of XXXX
 * 
 * @package makeup\services
 */
class XXXX extends Service
{
    public function __construct()
    {
        /**
         * IMPORTANT: Modify the constructor first.
         * Supply the table name, a column with a unique id and the relevant columns.
         */
        parent::__construct([
            "table" => "table_name",
			"uniqueID" => "unique_id",
			"columns" => "col1, col2, col3, ..."
        ]);
    }
}


/**
 * Single item.
 *
 * @package makeup\services
 */
class XXXXItem extends ServiceItem
{

}

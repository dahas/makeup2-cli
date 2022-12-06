<?php

namespace makeUp\services;

use makeUp\lib\attributes\Data;
use makeUp\lib\Service;
use makeUp\lib\ServiceItem;

/**
 * Please provide a table name, the column with the unique id as 'key' and the relevant columns.
 */
#[Data(
    table: 'table_name',
    key: 'unique_id',
    columns: 'col1, col2, col3, ...'
)]
class XXXX extends Service 
{
    public function __construct()
    {
        parent::__construct();
    }
}


/**
 * Single item.
 *
 * @package makeup\services
 */
class XXXXItem extends ServiceItem {

}
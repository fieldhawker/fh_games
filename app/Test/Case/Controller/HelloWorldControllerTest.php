<?php

App::uses('Controller', 'Controller');
App::uses('View', 'View');
App::uses('HelloWorldController', 'Controller');

class HelloWorldControllerTest extends CakeTestCase 
{

    public function setUp()
    {
        //$this->object = new Fortune;
    }

    public function testIndex()
    {
         $this->assertEquals("", "");
    }

}
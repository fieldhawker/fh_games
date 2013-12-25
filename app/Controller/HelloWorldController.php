<?php

App::uses('AppController', 'Controller');

class HelloWorldController extends AppController {

public $name = 'HelloWorld';
public $uses = null;  // $uses = array(); でも同じ動作
public $autoRender = true;
public $autoLayout = true;

public function index()
{
	$this->set('message', 'Hello World:)');
	//echo "hello world!";
}

}
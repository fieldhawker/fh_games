/* --------------------------------------------------------- 
 * レガシーシューティング
 * 
 * 上下左右       : キャラクタ移動
 * スペース or z  : 攻撃
 * 
 * 三回HIT        : ゲームオーバー
 * --------------------------------------------------------- */

enchant();				 // おまじない

// 素材
var KUMA_IMAGE_PATH		= "img/stg_01/chara1.png"; // プレイヤーイメージ
var BG_IMAGE_PATH		= "img/stg_01/background.jpg"; // 背景イメージ
var EFFECT_IMAGE_PATH	= "img/stg_01/effect.png"; // エフェクトイメージ
var ENEMY_IMAGE_PATH	= "img/stg_01/enemy.png"; // 敵イメージ
var V_BUTTON			= "img/stg_01/button.png";

var PRELOAD_IMAGE		= [
	KUMA_IMAGE_PATH,
	BG_IMAGE_PATH,
	EFFECT_IMAGE_PATH,
	ENEMY_IMAGE_PATH,
	V_BUTTON,
];

// 定数
var SCREEN_WIDTH			= 320;// 画面幅
var SCREEN_HEIGHT			= 480;// 画面高さ
var FRAME_RATE				= 30; // フレームレート
var USER_MOVE_VALUE			= 4;  // 自機の単位当たりの移動量
var USER_ATTACK_MOVE_VALUE	= 3;  // 自機の攻撃の単位当たりの移動量
var USER_WIDTH				= 32;
var USER_HEIGHT				= 32;

// 難易度
var ENV_DEBUG = true;

// 背景定数
var BACKGROUND_COLOR	= "#000";
var BACKGROUND_WIDTH	= 320;	// 幅
var BACKGROUND_HEIGHT	= 2384;	// 高さ
var SCROLL_SPEED		= 2;	// スクロール速度

// スコア定数
var SCORE_TITLE			= "Score : ";
var SCORE_COLOR_WHITE	= "white";
var SCORE_FONT_ARIAL	= '14px "Arial"';
var REMAIN_TITLE		= "Remain : ";

// 攻撃定数
var ATTACK_COMMAND		= "attack";

// グローバル変数

var game = null;			// ゲーム
var enemys = [];			// 敵リスト
var player = null;			// 自機
var score = null;			// スコア
var pad = null;
var score_point = 0;		// 初期スコア
var remain_point = 1000;	// 残り自機数

var attack_flg = -1;		// 攻撃間隔調整


//ページが開いたら以下の処理を実行
window.onload = function() {
	
	//Gameオブジェクトの生成
	game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
	game.fps = FRAME_RATE;
	// リソース読み込み
	game.preload(PRELOAD_IMAGE);
	
	// キーバインド
	game.keybind(90, ATTACK_COMMAND);		//z
	game.keybind(32, ATTACK_COMMAND);		//space
	
	// gameオブジェクト生成時の処理
	game.onload = function() {
		
		// 初期Scene設定
		var scene = game.rootScene;
		scene.backgroundColor = BACKGROUND_COLOR;

		// 背景生成
		var bg = new BackGround();
		scene.addChild(bg);

		// 得点
		score = new Label();
		score.x = 10;
		score.y = 5;
		score.color = SCORE_COLOR_WHITE;
		score.font = SCORE_FONT_ARIAL;
		score.text = SCORE_TITLE + score_point;
		score.on('enterframe', function() {
			score.text = SCORE_TITLE + score_point;
		});
		scene.addChild(score);

		// 残機
		remain = new Label();
		remain.x = 240;
		remain.y = 5;
		remain.color = 'white';
		remain.font = '14px "Arial"';
		remain.text = REMAIN_TITLE + remain_point;
		remain.on('enterframe', function() {
			remain.text = REMAIN_TITLE + remain_point;
		});
		scene.addChild(remain);

		// 自キャラ生成
		var user = new User();
		user.x = (SCREEN_WIDTH - user.width) / 2;
		user.y = SCREEN_HEIGHT - user.height;
		scene.addChild(user);

		player = user;
		
		// 攻撃用ボタン
		var bspace = new Button();
		//bspace.moveTo(10, 10);
		bspace.x = SCREEN_WIDTH - 50;
		bspace.y = SCREEN_HEIGHT - 50;
		//        this.buttonMode = mode;    // ボタンモード
		//bspace.image = game.assets[KUMA_IMAGE_PATH]; // Spriteに画像を設定

        scene.addChild( bspace );

	pad = new APad();
	pad.moveTo(20, SCREEN_HEIGHT-120);
	scene.addChild(pad);

		// 画面描画更新時の処理
		scene.onenterframe = function() {
			
			// 敵発生タイミング
			if (game.frame % 120 == 0) {
				// 敵キャラ生成
				var enemy = new Enemy();
				var x = Math.random()*(game.width-enemy.width);		// 横位置ランダム
				//var y = Math.random()*(game.height-enemy.height);
				enemy.moveTo(x, enemy.height);
				enemys.push(enemy);									// 判定用リストに追加
				scene.addChild(enemy);
				
				// 敵挙動テスト
				enemy.tl.moveTo(x-100, enemy.height+SCREEN_HEIGHT/4*1, FRAME_RATE * 2, enchant.Easing.QUAD_EASEINOUT);
				enemy.tl.moveTo(x+100, enemy.height+SCREEN_HEIGHT/4*2, FRAME_RATE * 2, enchant.Easing.QUAD_EASEINOUT);
				enemy.tl.moveTo(x-100, enemy.height+SCREEN_HEIGHT/4*3, FRAME_RATE * 2, enchant.Easing.QUAD_EASEINOUT);
				enemy.tl.moveTo(x+100, enemy.height+SCREEN_HEIGHT/4*4, FRAME_RATE * 2, enchant.Easing.QUAD_EASEINOUT);

			};
			
			if (game.frame == attack_flg) {
				attack_flg = -1;
			}
		}

	};
	

	// ゲーム開始
	game.start();

};

// ユーザキャラクラス
var Button = Class.create(Sprite, {
	// 初期状態
	initialize: function() {
		// 親クラスのコール
		Sprite.call(this, 32, 32);

		this.image = game.assets[KUMA_IMAGE_PATH]; // Spriteに画像を設定
	},
	// 画面描画更新時の処理
	ontouchstart:function(){
		// 攻撃
			
			if(attack_flg == -1){
				// 攻撃キャラ生成
				var attack = new Attack();
				var x = player.width;			// 横位置自機
				var y = player.height;		// 縦位置自機
				attack.moveTo(player.x, player.y);
				//enemys.push(enemy);								  // 判定用リストに追加
				game.rootScene.addChild(attack);
				attack_flg = game.frame + FRAME_RATE / 3;
			}


	}
});
// ユーザキャラクラス
var User = Class.create(Sprite, {
	
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Sprite.call(this, USER_WIDTH, USER_HEIGHT);

		this.image = game.assets[KUMA_IMAGE_PATH]; // Spriteに画像を設定
		this.frameIndex = 0;					   // 初期フレーム番号
		this.frameList = [0, 1, 2];				// フレームパターン

		//this.scaleX = 2;   // 幅を2倍にする
		//this.scaleY = 0.5; // 高さを0.5倍にする
		//this.scaleX = -1;  // 左右を反転させる
		//this.scale(2, 3);  // 幅を2倍に、高さを3倍にする

		//this.rotation = 90;  // 時計回りに90度回転させる
		//this.rotation = 220; // 時計回りに220度回転させる
		//this.rotate(3);	  // 時計回りに3度回転させる


	},
	// 画面描画更新時の処理
	onenterframe:function(){
		
		if (pad.isTouched) {
		this.x += pad.vx * USER_MOVE_VALUE;
		this.y += pad.vy * USER_MOVE_VALUE;
		
		if (pad.vx >= 0 && this.scaleX == -1) { this.scaleX *= -1; }
		if (pad.vx < 0 && this.scaleX != -1) { this.scaleX *= -1; }
	    }
		// 上キー
		if(game.input.up) {
			this.y -= USER_MOVE_VALUE;
		}
		// 下キー
		if(game.input.down) {
			this.y += USER_MOVE_VALUE;
		}
		// 右キー
		if(game.input.right) {
			this.x += USER_MOVE_VALUE;
			if (this.scaleX == -1) { this.scaleX *= -1; };
		}
		// 左キー
		if(game.input.left) {
			this.x -= USER_MOVE_VALUE;
			if (this.scaleX != -1) { this.scaleX *= -1; };
		}
		
		// X軸
	    if (this.x < 0)		{ this.x = 0; }
	    else if (this.x > SCREEN_WIDTH - USER_WIDTH)	{ this.x = SCREEN_WIDTH - USER_WIDTH; }
	    // Y軸
	    if (this.y < 0)		{ this.y = 0; }
	    else if (this.y > SCREEN_HEIGHT - USER_HEIGHT)	{ this.y = SCREEN_HEIGHT - USER_HEIGHT; }
	    
		// アニメ
		if( (game.input.up) || (game.input.right) || (game.input.down) || (game.input.left) || (pad.isTouched) ) {
			
			if(game.frame %2 == 0){
				this.frameIndex ++;
				this.frameIndex %= this.frameList.length;
				this.frame = this.frameList[this.frameIndex];
			}
		};
		
		// 攻撃
		if(game.input.attack) {
			
			if(attack_flg == -1){
				// 攻撃キャラ生成
				var attack = new Attack();
				var x = this.width;			// 横位置自機
				var y = this.height;		// 縦位置自機
				attack.moveTo(this.x, this.y);
				//enemys.push(enemy);								  // 判定用リストに追加
				game.rootScene.addChild(attack);
				attack_flg = game.frame + FRAME_RATE / 5;
			}
		}
		
		// 当たり判定
		for (var i = 0; i < enemys.length; i++) {
			var en = enemys[i];

			if(this.intersect(en)){
				// 食べる系
				//game.rootScene.removeChild(en);

				// 避ける系
				remain_point -= 1;
				game.rootScene.removeChild(en);
				var index = enemys.indexOf(en);
				enemys.splice(index, 1);

				if (remain_point <= 0) {
					//alert("がめおべ");
					GameoverScene = new GameoverScene();
					game.pushScene(GameoverScene);
					game.stop();
				}

			}
		}


	},
	// 画面描画更新時の処理
	ontouchmove:function(e){
		var x = e.x - (this.width / 2) - 1;
		var y = e.y - (this.height / 2) - 1;
		this.moveTo(x, y);
	}
});

// 敵キャラクラス
var Enemy = Class.create(Sprite, {
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Sprite.call(this, 23, 28);

		this.image = game.assets[ENEMY_IMAGE_PATH];	// Spriteに画像を設定
		this.frameIndex = 0;						// 初期フレーム番号
		this.frameList = [0, 1, 2];					// フレームパターン

	},
	// 画面描画更新時の処理
	onenterframe:function(){
		
		// 移動
		//this.y += 1;
		
		// 画面外で削除
		if (this.y > SCREEN_HEIGHT) {
			game.rootScene.removeChild(this);
			enemys.splice(enemys.indexOf(this),1);  // あとで
		}

		// アニメ
		if(game.frame %20 == 0){
			this.frameIndex ++;
			this.frameIndex %= this.frameList.length - 1;
			this.frame = this.frameList[this.frameIndex];
		};

		// 敵攻撃挙動
		var moveX = [
			0,
			-SCREEN_WIDTH/2,
			-SCREEN_WIDTH,
			-SCREEN_WIDTH/2,
			0,
			SCREEN_WIDTH/2,
			SCREEN_WIDTH,
			SCREEN_WIDTH/2
		];
		var moveY = [
			-SCREEN_HEIGHT,
			-SCREEN_HEIGHT,
			0,
			SCREEN_HEIGHT,
			SCREEN_HEIGHT,
			SCREEN_HEIGHT,
			0,
			-SCREEN_HEIGHT
		];
		
		if (game.frame %30 == 0){
			
			for( i = 0 ; i < 8 ; i++ ){
				if(ENV_DEBUG && (i%3!=1)){
					var ea = new EnemyAttack();
					ea.moveTo(this.x, this.y);
					game.rootScene.addChild(ea);
					ea.tl.moveTo(this.x+moveX[i], this.y+moveY[i], FRAME_RATE * 5);
				}
			}
			
		}

	}

});

// 敵攻撃キャラクラス
var EnemyAttack = Class.create(Sprite, {
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Sprite.call(this, 16, 16);

		this.image = game.assets[EFFECT_IMAGE_PATH];	// Spriteに画像を設定
		this.frameIndex = 0;							// 初期フレーム番号
		this.frameList = [0, 1, 2, 3];					// フレームパターン

	},
	// 画面描画更新時の処理
	onenterframe:function(){
		
		// 当たり判定
		if(this.intersect(player)){
			// 貫通はしない
			game.rootScene.removeChild(this);
			remain_point -= 1;
		}
		
		// 移動
//		this.y -= USER_ATTACK_MOVE_VALUE;
		
		// 画面外で削除
		if (this.y > SCREEN_HEIGHT || this.y < 0 || this.x > SCREEN_WIDTH || this.x < 0 ) {
			game.rootScene.removeChild(this);
		}
		
		// アニメ
		if(game.frame %4 == 0){
			this.frameIndex ++;
			this.frameIndex %= this.frameList.length;
			this.frame = this.frameList[this.frameIndex];
		}
	}

});

// 攻撃キャラクラス
var Attack = Class.create(Sprite, {
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Sprite.call(this, 16, 16);

		this.image = game.assets[EFFECT_IMAGE_PATH];	// Spriteに画像を設定
		this.frameIndex = 0;							// 初期フレーム番号
		this.frameList = [0, 1, 2, 3];					// フレームパターン

	},
	// 画面描画更新時の処理
	onenterframe:function(){
		
		// 当たり判定
		for (var i = 0; i < enemys.length; i++) {
			var en = enemys[i];
			if(this.intersect(en)){
				// 貫通はしない
				game.rootScene.removeChild(this);
				
				// 退治
				game.rootScene.removeChild(en);
				var index = enemys.indexOf(en);
				enemys.splice(index, 1);
				
				// 加点
				score_point += 10;
			}
		}
		
		// 移動
		this.y -= USER_ATTACK_MOVE_VALUE;
		
		// 画面外で削除
		if (this.y == SCREEN_HEIGHT) {
			game.rootScene.removeChild(this);
		}
		
		// アニメ
		if(game.frame %4 == 0){
			this.frameIndex ++;
			this.frameIndex %= this.frameList.length;
			this.frame = this.frameList[this.frameIndex];
		}
	}

});

// 背景クラス
var BackGround = Class.create(Sprite, {
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Sprite.call(this, BACKGROUND_WIDTH, BACKGROUND_HEIGHT);

		this.image = game.assets[BG_IMAGE_PATH]; // Spriteに画像を設定
//		this.frameIndex = 0;					   // 初期フレーム番号
//		this.frameList = [0, 1, 2];				// フレームパターン

	},
	// 画面描画更新時の処理
	onenterframe:function(){
		
		// スクロール
		this.y += SCROLL_SPEED;
		// 端まで行ったら戻す
		if (this.y >= 0) {
			this.moveTo(0, -this.height + game.height);
		}

	}

});



var GameoverScene =  Class.create(Scene, {
	
	// 初期状態
	initialize: function() {
		
		// 親クラスのコール
		Scene.call(this, SCREEN_WIDTH, SCREEN_HEIGHT);
		// 設定
		this.backgroundColor = '#303030'; 
		
		var label = new Label();
		label.color = 'red';
		label.font = '14px "Arial"';
		label.text = "がめおべ";

		label.x = (SCREEN_WIDTH - label._boundWidth) /  2;
		label.y = (SCREEN_HEIGHT - label.height) /  2;
		
		this.addChild(label);
		
	}
	

});

		
//	// スコアラベル
//	var scoreLabel = null;
//
//	// フレームとスコアとリセット
//	game.score = 0;
//
//	// スコアラベルを生成, 表示
//	scoreLabel = new Label();
//	scene.addChild(scoreLabel);
//	scoreLabel.moveTo(200, 10);
//	scoreLabel.color = "black";
//	scoreLabel.font = "11px 'Consolas', 'Monaco', 'ＭＳ ゴシック'";
//	scoreLabel.text = SCORE_TITLE;
//
//
//
//	scene.onenterframe = function() {
//
//		// スコアを更新
//		scoreLabel.text = SCORE_TITLE + game.score;
//
//	}
//
//	var tmrExecte;
//
//	function countUpPoint(scoreLabel) {
//		var charge_point = scoreLabel.text.substr(SCORE_TITLE.length-1);
//		charge_point = parseInt(charge_point) + 1;
////alert(scoreLabel.text);
//		scoreLabel.text = SCORE_TITLE;
////alert(scoreLabel.text);
//		scoreLabel.text += charge_point;
////alert(scoreLabel.text);
//		//scene.replaceChild(scoreLabel,scoreLabel);
//	}
//
//	
//	// デフォルト(ダーク)
//	var button = new Button("Charge!!");
//	button.moveTo(10, 10);
//	button.ontouchstart = function() {
//		
//		//scene.backgroundColor = "red"
//		clearInterval(tmrExecte);
////alert(scoreLabel.text);
//		//var charge_point;
//		//charge_point = scoreLabel.text.substr(7);
//		//charge_point = 0;
//		countUpPoint(scoreLabel);
//alert(scoreLabel.text);
//scene.addChild(scoreLabel);
//
//	};
//	button.ontouchend = function() {
//		
//		//scene.backgroundColor = "red"
//	};
//	scene.addChild(button);
//	};
//	game.start();
//	
//};
// ボール






//// 素材(必要になりそうなやつ)
//var KUMA_IMAGE_PATH	  = "images/chara1.png"; // プレイヤーイメージ
////var MAIN_BGM			 = "http://enchantjs.com/assets/sounds/bgm02.wav";  // メインBGM
////var TOUCH_SE_PATH		= "http://enchantjs.com/assets/sounds/se8.wav";	// クマタッチ時SE
////var TOUCH_KUMAKO_SE_PATH = "http://jsrun.it/assets/b/1/R/m/b1Rm4.wav";	  // クマ子タッチ時SE
////var TOUCH_KUMAYA_SE_PATH = "http://enchantjs.com/assets/sounds/se9.wav";	// クマ也タッチ時SE
//
//// 定数
//var SCREEN_WIDTH		  = 320;// 画面幅
//var SCREEN_HEIGHT		 = 320;// 画面高さ
//var FRAME_RATE			= 30; // フレームレート
//var KUMA_SPEED			= 2;  // クマの移動速度
//
//// グローバル変数
//var game	   = null;
//
//
//window.onload = function() {
//	game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
//	game.fps = FRAME_RATE;
//	// リソース読み込み
////	game.preload(KUMA_IMAGE_PATH, TOUCH_SE_PATH, TOUCH_KUMAKO_SE_PATH, TOUCH_KUMAYA_SE_PATH, MAIN_BGM);
//	game.preload(KUMA_IMAGE_PATH);
//	
//	game.onload = function() {
//	var scene = game.rootScene;
//	scene.backgroundColor = "#222";
//	
//	// シーン更新イベントリスナを登録
//	scene.onenterframe = function() {
//		if (game.frame % 15 == 0) {
//		var kuma = new Kuma();
//		// ランダムな位置に表示する
//		var x = Math.random()*(game.width-kuma.width);
//		var y = Math.random()*(game.height-kuma.height);
//		kuma.moveTo(x, y);
//		scene.addChild(kuma);
//		}
//	}
//
//
//	
//	// タッチした位置を確認するために補助サークルを表示する(ちょっとした思いやりが大切)
//	var circle = new Entity();
//	circle.width = 5;
//	circle.height = 5;
//	circle.backgroundColor = "white";
////	circle._style.borderRadius = "50%";
//	circle.borderRadius = "50%";
//	circle.visible = false;
//	scene.addChild(circle);
//	scene.addEventListener("touchstart", function(e){
//		circle.x = e.x-circle.width/2;
//		circle.y = e.y-circle.height/2;
//		circle.visible = true;
//	});
//	};
//	
//
//	game.start();
//};
//
//// クマクラス
//var Kuma = Class.create(Sprite, {
//	// 初期化
//	initialize: function() {
//	Sprite.call(this, 32, 32);
//	
//	this.image = game.assets[KUMA_IMAGE_PATH];
//	// 移動値をセット
//	this.vx = Math.floor( Math.random()*2 ) ? -1 : 1;
//	this.vy = Math.floor( Math.random()*2 ) ? -1 : 1;
//	this.speed = KUMA_SPEED;;
//	this.scaleX = this.vx;
//	
//	// アニメーション用パラメータ
//	this.frameIndex = 0;
//	this.frameList = [0, 1, 2];
//	
//	// 時間
//	this.time = 0;
//	// 設定値/FRAME_RATE=秒
//	this.limitTime = 120;
//	  
//	},
//	
//	// クマ系クラス共通処理
//	onenterframe: function() {
//	// 更新処理
//	this.update();
//	
//	// フレームアニメーション
//	this.anim();
//	
//	
//	// リミット時間を超えたら消す
//	if (this.time > this.limitTime) {
//		this.parentNode.removeChild(this);
//	}
//	
//	// タイム加算
//	++this.time;
//	},
//	
//	// クマ系クラス共通処理
//	ontouchstart: function() {
//	this.parentNode.removeChild(this);
//	},
//	
//	// 更新
//	update: function() {
//	// TODO: 動きを変更したいときはここに書く(継承先も同様)
//	// 移動
//	this.x += this.vx * this.speed;
//	this.y += this.vy * this.speed;
//	// 画面外に出ないよう制御する
//	this.control();
//	},
//	
//	// アニメーション
//	anim: function() {
//	if (game.frame % 4 == 0) {
//		this.frameIndex += 1;
//		this.frameIndex %= this.frameList.length;
//		this.frame = this.frameList[this.frameIndex];
//	}
//	},
//// 画面からはみ出ないよう制御
//	control: function() {
//	var left   = 0;
//	var right  = game.width-this.width;
//	var top	= 0;
//	var bottom = game.height-this.height;
//	
//	if (this.x < left) {
//		this.x = left; this.vx *= -1; this.scaleX *= -1;
//	}
//	if (this.x > right) {
//		this.x = right; this.vx *= -1; this.scaleX *= -1;
//	}
//	if (this.y < top) {
//		this.y = left; this.vy *= -1;
//	}
//	if (this.y > bottom) {
//		this.y = right; this.vy *= -1;
//	}
//	}
//});






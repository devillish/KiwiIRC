buster.testCase("randomString", {
	"Returns the correct length": function () {
		var i;
		for (i = 0; i < 20; i++) {
			assert(randomString(i).length === i);
		}
	},
	"Returns different strings on each call": function () {
		var s1, s2;
		s1 = randomString(10);
		s2 = randomString(10);
		assert(s1 !== s2);
	}
});

buster.testCase("secondsToTime", {
	"< 1 minute": function () {
		var obj = secondsToTime(59);
		assert(obj.h === 0);
		assert(obj.m === 0);
		assert(obj.s === 59);
	},
	"= 1 minute": function () {
		var obj = secondsToTime(60);
		assert(obj.h === 0);
		assert(obj.m === 1);
		assert(obj.s === 0);
	},
	"< 1 hour": function () {
		var obj = secondsToTime(3599);
		assert(obj.h === 0);
		assert(obj.m === 59);
		assert(obj.s === 59);
	},
	"= 1 hour": function () {
		var obj = secondsToTime(3600);
		assert(obj.h === 1);
		assert(obj.m === 0);
		assert(obj.s === 0);
	}
});

buster.testCase("formatIRCMsg", {
	"No formatting": function () {
		var html = formatIRCMsg("This is a test message");
		assert (html === "This is a test message");
	},
	"Bold formatting only": function () {
		var html = formatIRCMsg("This is a \x02test\x02 message");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">test</span> message');
	},
	"Italic formatting only": function () {
		var html = formatIRCMsg("This is a \x1Dtest\x1D message");
		assert (html === 'This is a <span class="format_span" style="font-style: italic; ">test</span> message');
	},
	"Underline formatting only": function () {
		var html = formatIRCMsg("This is a \x1Ftest\x1F message");
		assert (html === 'This is a <span class="format_span" style="text-decoration: underline; ">test</span> message');
	},
	"Colour formatting only: white foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "0test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF">test</span> message');
	},
	"Colour formatting only: black foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "1test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #000000">test</span> message');
	},
	"Colour formatting only: navy foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "2test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #000080">test</span> message');
	},
	"Colour formatting only: green foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "3test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #008000">test</span> message');
	},
	"Colour formatting only: red foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "4test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FF0000">test</span> message');
	},
	"Colour formatting only: maroon foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "5test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #800040">test</span> message');
	},
	"Colour formatting only: purple foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "6test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #800080">test</span> message');
	},
	"Colour formatting only: orange foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "7test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FF8040">test</span> message');
	},
	"Colour formatting only: yellow foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "8test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFF00">test</span> message');
	},
	"Colour formatting only: lime foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "9test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #80FF00">test</span> message');
	},
	"Colour formatting only: teal foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "10test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #008080">test</span> message');
	},
	"Colour formatting only: cyan foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "11test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #00FFFF">test</span> message');
	},
	"Colour formatting only: blue foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "12test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #0000FF">test</span> message');
	},
	"Colour formatting only: pink foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "13test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FF55FF">test</span> message');
	},
	"Colour formatting only: dark grey foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "14test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #808080">test</span> message');
	},
	"Colour formatting only: light grey foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "15test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #C0C0C0">test</span> message');
	},
	"Colour formatting only: invalid foreground": function () {
		var html = formatIRCMsg("This is a \x03" + "16test\x03 message");
		assert (html === 'This is a test message');
	},
	"Colour formatting only: white foreground, white background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,0test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #FFFFFF;">test</span> message');
	},
	"Colour formatting only: white foreground, black background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,1test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #000000;">test</span> message');
	},
	"Colour formatting only: white foreground, navy background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,2test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #000080;">test</span> message');
	},
	"Colour formatting only: white foreground, green background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,3test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #008000;">test</span> message');
	},
	"Colour formatting only: white foreground, red background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,4test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #FF0000;">test</span> message');
	},
	"Colour formatting only: white foreground, maroon background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,5test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #800040;">test</span> message');
	},
	"Colour formatting only: white foreground, purple background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,6test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #800080;">test</span> message');
	},
	"Colour formatting only: white foreground, orange background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,7test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #FF8040;">test</span> message');
	},
	"Colour formatting only: white foreground, yellow background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,8test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #FFFF00;">test</span> message');
	},
	"Colour formatting only: white foreground, lime background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,9test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #80FF00;">test</span> message');
	},
	"Colour formatting only: white foreground, teal background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,10test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #008080;">test</span> message');
	},
	"Colour formatting only: white foreground, cyan background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,11test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #00FFFF;">test</span> message');
	},
	"Colour formatting only: white foreground, blue background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,12test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #0000FF;">test</span> message');
	},
	"Colour formatting only: white foreground, pink background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,13test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #FF55FF;">test</span> message');
	},
	"Colour formatting only: white foreground dark grey background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,14test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #808080;">test</span> message');
	},
	"Colour formatting only: white foreground light grey background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,15test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF; background-color: #C0C0C0;">test</span> message');
	},
	"Colour formatting only: white foreground, invalid background": function () {
		var html = formatIRCMsg("This is a \x03" + "0,16test\x03 message");
		assert (html === 'This is a <span class="format_span" style="color: #FFFFFF">test</span> message');
	},
	"Bold and italic formatting, not overlapping": function () {
		var html = formatIRCMsg("This is a \x02test\x02 \x1Dmessage\x1D");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">test</span> <span class="format_span" style="font-style: italic; ">message</span>');
	},
	"Bold and underline formatting, not overlapping": function () {
		var html = formatIRCMsg("This is a \x02test\x02 \x1Fmessage\x1F");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">test</span> <span class="format_span" style="text-decoration: underline; ">message</span>');
	},
	"Bold and foreground colour, not overlapping": function () {
		var html = formatIRCMsg("This is a \x02test\x02 \x03" + "0message\x03");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">test</span> <span class="format_span" style="color: #FFFFFF">message</span>');
	},
	"Italic and underline formatting, not overlapping": function () {
		var html = formatIRCMsg("This is a \x1Dtest\x1D \x1Fmessage\x1F");
		assert (html === 'This is a <span class="format_span" style="font-style: italic; ">test</span> <span class="format_span" style="text-decoration: underline; ">message</span>');
	},
	"Bold and foreground colour": function () {
		var html = formatIRCMsg("This is a \x02\x03" + "0test\x03\x02 message");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; "></span><span class="format_span" style="font-weight: bold; color: #FFFFFF">test</span><span class="format_span" style="font-weight: bold; "></span> message');
	},
	"Bold and foreground colour, overlapping": function () {
		var html = formatIRCMsg("This is a \x02te\x03" + "0st\x02\x03 message");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">te</span><span class="format_span" style="font-weight: bold; color: #FFFFFF">st</span><span class="format_span" style="color: #FFFFFF"></span> message');
	},
	"Italic and foreground colour": function () {
		var html = formatIRCMsg("This is a \x1D\x03" + "0test\x03\x1D message");
		assert (html === 'This is a <span class="format_span" style="font-style: italic; "></span><span class="format_span" style="font-style: italic; color: #FFFFFF">test</span><span class="format_span" style="font-style: italic; "></span> message');
	},
	"Italic and foreground colour, overlapping": function () {
		var html = formatIRCMsg("This is a \x1Dte\x03" + "0st\x1D\x03 message");
		assert (html === 'This is a <span class="format_span" style="font-style: italic; ">te</span><span class="format_span" style="font-style: italic; color: #FFFFFF">st</span><span class="format_span" style="color: #FFFFFF"></span> message');
	},
	"Underline and foreground colour": function () {
		var html = formatIRCMsg("This is a \x1F\x03" + "0test\x03\x1F message");
		assert (html === 'This is a <span class="format_span" style="text-decoration: underline; "></span><span class="format_span" style="text-decoration: underline; color: #FFFFFF">test</span><span class="format_span" style="text-decoration: underline; "></span> message');
	},
	"Underline and foreground colour, overlapping": function () {
		var html = formatIRCMsg("This is a \x1Fte\x03" + "0st\x1F\x03 message");
		assert (html === 'This is a <span class="format_span" style="text-decoration: underline; ">te</span><span class="format_span" style="text-decoration: underline; color: #FFFFFF">st</span><span class="format_span" style="color: #FFFFFF"></span> message');
	},
	"Bold and italic formatting, overlapping": function () {
		var html = formatIRCMsg("This is a \x02te\x1Dst\x02\x1D message");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">te</span><span class="format_span" style="font-weight: bold; font-style: italic; ">st</span><span class="format_span" style="font-style: italic; "></span> message');
	},
	"Bold and underline formatting, overlapping": function () {
		var html = formatIRCMsg("This is a \x02te\x1Fst\x02\x1F message");
		assert (html === 'This is a <span class="format_span" style="font-weight: bold; ">te</span><span class="format_span" style="font-weight: bold; text-decoration: underline; ">st</span><span class="format_span" style="text-decoration: underline; "></span> message');
	},
	"Italic and underline formatting, overlapping": function () {
		var html = formatIRCMsg("This is a \x1Dte\x1Fst\x1D\x1F message");
		assert (html === 'This is a <span class="format_span" style="font-style: italic; ">te</span><span class="format_span" style="font-style: italic; text-decoration: underline; ">st</span><span class="format_span" style="text-decoration: underline; "></span> message');
	}
});
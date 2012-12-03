/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumUnistrokes = 6;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = new Array(NumUnistrokes);
	this.Unistrokes[0] = new Unistroke("forward", new Array(new Point(0,0), new Point(50, -50), new Point(100,0)));
  this.Unistrokes[1] = new Unistroke("backward", new Array(new Point(100, 0), new Point(50, -50), new Point(0, 0)));
  this.Unistrokes[2] = new Unistroke("magnify", new Array(new Point(0, 100), new Point(0, 0), new Point(50, 100), new Point(100, 0), new Point(100, 100)));
  this.Unistrokes[3] = new Unistroke("zoom", new Array(new Point(0,0), new Point(100, 0), new Point(0, 100), new Point(100, 100)));
  this.Unistrokes[4] = new Unistroke("forward2", new Array(new Point(258, 289), new Point(261.64194997899864, 284.4475625262517), new Point(262, 284), new Point(265.36532445934836, 279.96161064878197), new Point(269.0975768119815, 275.48290782562214), new Point(272, 272), new Point(272.91657627057606, 271.08342372942394), new Point(277.03898373478404, 266.96101626521596), new Point(281.161391198992, 262.838608801008), new Point(285.2837986632, 258.7162013368), new Point(289.406206127408, 254.59379387259202), new Point(292, 252), new Point(293.74035849709026, 250.7176305810914), new Point(298.4338054860171, 247.25930122082954), new Point(303.12725247494393, 243.80097186056767), new Point(307.82069946387077, 240.34264250030577), new Point(311, 238), new Point(312.66222549601224, 237.11999826681705), new Point(317.81467771406665, 234.3922294454941), new Point(322.9671299321211, 231.66446062417117), new Point(328, 229), new Point(328.13126647694344, 228.96718338076414), new Point(333.78716285688415, 227.55320928577896), new Point(339.44305923682487, 226.13923519079378), new Point(345.0989556167656, 224.7252610958086), new Point(350.7548519967063, 223.31128700082343), new Point(352, 223), new Point(356.5464953612343, 223), new Point(362.3764599067453, 223), new Point(368, 223), new Point(368.1846316429853, 223.09231582149266), new Point(373.39911045505585, 225.69955522752792), new Point(376, 227), new Point(377.6208792553661, 229.4313188830492), new Point(380, 233), new Point(380.19113053389884, 234.52904427119063), new Point(380.9142486389658, 240.31398911172627), new Point(381, 241), new Point(377.1327981300653, 244.38380163619289), new Point(373, 248), new Point(372.67893359812297, 248.10702213395902), new Point(367.14814360557, 249.95061879814332), new Point(364, 251), new Point(361.50786452898103, 251.31151693387736), new Point(355.7229196884454, 252.03463503894432), new Point(349.9379748479098, 252.75775314401128), new Point(348, 253), new Point(344.12309204618504, 253), new Point(338.293127500674, 253), new Point(337, 253), new Point(332.6377225348452, 251.75363500995576), new Point(330, 251), new Point(329.11304566630304, 248.04348555434353), new Point(327.4378176812237, 242.4593922707457), new Point(327, 241), new Point(327.42849428644956, 236.7150571355044), new Point(328, 231), new Point(328.0684852550549, 230.94731903457316), new Point(332.68945500945625, 227.3927269158029), new Point(337.31042476385755, 223.83813479703264), new Point(341, 221), new Point(342.15770004488496, 220.79866086175915), new Point(347.90144964530435, 219.79974788777315), new Point(353.64519924572375, 218.80083491378716), new Point(359.38894884614314, 217.8019219398012), new Point(364, 217), new Point(365.13526098767414, 217.18164175802787), new Point(370.89200486254555, 218.1027207780073), new Point(376.64874873741695, 219.02379979798673), new Point(382.40549261228836, 219.94487881796616), new Point(388.16223648715976, 220.86595783794556), new Point(389, 221), new Point(393.66436633047874, 222.74913737392953), new Point(399.1231322386338, 224.79617458948766), new Point(404.58189814678883, 226.8432118050458), new Point(405, 227), new Point(409.4262154015474, 230.06430297030204), new Point(414.2195667284266, 233.3827769658338), new Point(418, 236), new Point(418.7886894861515, 236.94642738338177), new Point(422.52094183878467, 241.42513020654158), new Point(426.25319419141783, 245.9038330297014), new Point(428, 248), new Point(429.5061567883515, 250.7110822190328), new Point(432.337437858901, 255.80738814602182), new Point(433, 257), new Point(435.1687189294505, 260.90369407301085), new Point(437.99999999999994, 265.99999999999994), new Point(438, 266)));
  this.Unistrokes[5] = new Unistroke("backward2", new Array(new Point(500, 276), new Point(498, 272), new Point(496.5884084839403, 269.6473474732339), new Point(492.87592200133855, 263.4598700022309), new Point(492, 262), new Point(488.4119982037097, 257.81399790432795), new Point(483.7160329766662, 252.33537180611057), new Point(479.02006774962274, 246.8567457078932), new Point(474.32410252257927, 241.37811960967582), new Point(474, 241), new Point(469.0067255207027, 236.5060529686324), new Point(463.64328094136573, 231.67895284722914), new Point(458.2798363620288, 226.8518527258259), new Point(454, 223), new Point(452.8209875309671, 222.1425363861579), new Point(446.98532854001394, 217.89842075637378), new Point(441.1496695490608, 213.65430512658966), new Point(435.3140105581076, 209.41018949680554), new Point(432, 207), new Point(429.2111657087458, 205.6055828543729), new Point(422.75717882696983, 202.37858941348492), new Point(416.3031919451939, 199.15159597259694), new Point(412, 197), new Point(409.73242712752443, 196.19968016265568), new Point(402.92801945317626, 193.79812451288575), new Point(396.1236117788281, 191.3965688631158), new Point(395, 191), new Point(388.9757644450756, 191), new Point(381.7599877483041, 191), new Point(379, 191), new Point(374.65831847874006, 192.00192650490615), new Point(367.62732919530754, 193.62446249339058), new Point(366, 194), new Point(361.8264517717224, 197.6518546997429), new Point(358, 201), new Point(356.7612017124682, 202.73431760254445), new Point(353, 208), new Point(352.7384970979006, 208.69734107226506), new Point(350.2048687503969, 215.45368333227495), new Point(350, 216), new Point(349.2675838588088, 222.591745270721), new Point(349, 225), new Point(349, 229.792701798509), new Point(349, 231), new Point(349, 236), new Point(349.80678279622435, 236.60508709716828), new Point(353, 239), new Point(356.1616423348222, 239.63232846696445), new Point(358, 240), new Point(362, 240), new Point(362.68994517503194, 238.8500913749468), new Point(365, 235), new Point(365, 232.27416282284324), new Point(365, 225.05838612607178), new Point(365, 224), new Point(362.24633122397984, 218.4926624479597), new Point(359.0193377830919, 212.03867556618374), new Point(358, 210), new Point(353.5846886844078, 207.7923443422039), new Point(347.13070180263185, 204.56535090131592), new Point(340.6767149208559, 201.33835746042794), new Point(338, 200), new Point(334.0977674788448, 198.3852830946944), new Point(327.43026835203034, 195.62631793877117), new Point(320.7627692252159, 192.86735278284795), new Point(314.09527009840144, 190.10838762692472), new Point(309, 188), new Point(307.30142060971684, 187.90008356527747), new Point(300.09809565077654, 187.47635856769276), new Point(292.89477069183624, 187.05263357010804), new Point(285.69144573289594, 186.6289085725233), new Point(278.48812077395564, 186.20518357493856), new Point(275, 186), new Point(271.2878314464045, 186.2651548966854), new Point(264.0903922041739, 186.77925769970187), new Point(256.8929529619433, 187.29336050271834), new Point(249.69551371971272, 187.8074633057348), new Point(247, 188), new Point(242.79095142102776, 189.6293091273441), new Point(236.0617482693491, 192.23416196025198), new Point(229.33254511767043, 194.83901479315983), new Point(222.60334196599177, 197.4438676260677), new Point(216, 200), new Point(215.88044647082015, 200.06262327718943), new Point(209.4884839212803, 203.41079413647222), new Point(203.09652137174047, 206.75896499575498), new Point(196.70455882220062, 210.10713585503777), new Point(195, 211), new Point(190.43904964777084, 213.6829119718995), new Point(184.2195248238854, 217.34145598594975), new Point(178, 221)));
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }

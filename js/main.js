/*
Copyright(c) 2020 @guardiancrow
Released under the MIT license
*/

$(document).ready(function() {
	var unitdata = [];
	var parsonaldata = [];

	var limitlist = [
		"イベント配布",
		"イベント抽選",
		"五車祭",
		"特典",
		"決戦ユニット",
		"恒常"
	];

	var statuslist = [
		"max",
		"grow",
		"wait",
		"wish",
		"none"
	];

	const rot_sr = 0.0007;
	const rot_hr = 0.0023;
	const rot_r = 0.0178;
	var rot_user = 0;
	var times_user = 100;
	var sort_option = 'id';
	var hideUnowned = false;
	var hideMaxed = false;

	var vaildData = function(data) {
		if (!data) {
			return;
		}
		for (var i = 0; i < data.length; i++) {
			if (data[i]['status'] == '') {
				data[i]['status'] = 'none';
				data[i]['evo'] = 0;
				data[i]['luck'] = 0;
				data[i]['skill'] = 0;
				continue;
			} else if (data[i]['status'] == 'max' && (data[i]['evo'] != 2 || data[i]['trust'] != 3)) {
				data[i]['evo'] = 2;
				data[i]['trust'] = 3;
			} else if ((data[i]['status'] == 'wish' || data[i]['status'] == 'none') && (data[i]['evo'] != 0 || data[i]['trust'] != 0 || data[i]['luck'] != 0 || data[i]['skill'] != 0)) {
				data[i]['evo'] = 0;
				data[i]['trust'] = 0;
				data[i]['luck'] = 0;
				data[i]['skill'] = 0;
			}
		}
	}

	var moldData = function() {
		var result = [];
		var i, j;
		if (parsonaldata == null) {
			for (i = 0; i < unitdata.length; i++) {
				result.push({
					id: unitdata[i]['chara_id'],
					unit_id: unitdata[i]['unit_id'],
					name: unitdata[i]['name'],
					attribute: unitdata[i]['attribute'],
					rarity: unitdata[i]['rarity'],
					limited: unitdata[i]['limited'],
					status: '',
					evo: '',
					trust: '',
					luck: '',
					skill: ''
				});
			}
			vaildData(result);
			return result;
		}
		for (i = 0; i < unitdata.length; i++) {
			var b = false;
			if (unitdata[i]['rarity'] == 'N') {
				continue;
			}
			for (j = 0; j < parsonaldata.length; j++) {
				if (unitdata[i]['name'] == parsonaldata[j]['name']) {
					result.push({
						id: unitdata[i]['chara_id'],
						unit_id: unitdata[i]['unit_id'],
						name: unitdata[i]['name'],
						attribute: unitdata[i]['attribute'],
						rarity: unitdata[i]['rarity'],
						limited: unitdata[i]['limited'],
						status: parsonaldata[j]['status'],
						evo: parsonaldata[j]['evo'],
						trust: parsonaldata[j]['trust'],
						luck: parsonaldata[j]['luck'],
						skill: parsonaldata[j]['skill']
					});
					b = true;
					break;
				}
			}
			if (!b) {
				result.push({
					id: unitdata[i]['id_chara'],
					unit_id: unitdata[i]['unit_id'],
					name: unitdata[i]['name'],
					attribute: unitdata[i]['attribute'],
					rarity: unitdata[i]['rarity'],
					limited: unitdata[i]['limited'],
					status: '',
					evo: '',
					trust: '',
					luck: '',
					skill: ''
				});
			}
		}
		vaildData(result);
		return result;
	}

	var loadData = function() {
		var storedata = null;
		try {
			storedata = JSON.parse(localStorage.getItem('tmndeck'));
		} catch (e) {
			return null;
		}
		return storedata;
	}

	var saveData = function() {
		var data = [];
		var row = $("#unittable table tr");

		for (var i = 1; i < row.length; i++) {
			var cells = row.eq(i).children();
			var unitname = '';
			var status = '';
			var evo = '';
			var trust = '';
			var unit_id = row.eq(i).attr('unitid');
			var id = row.eq(i).attr('charaid');
			for (var j = 0; j < cells.length; j++) {
				if (cells.eq(j).find(".unitname").text()) {
					unitname = cells.eq(j).find(".unitname").text();
				}
				if (cells.eq(j).find(".status").val()) {
					status = cells.eq(j).find(".status").val();
				} else if (cells.eq(j).find(".evo").val()) {
					evo = cells.eq(j).find(".evo").val();
				} else if (cells.eq(j).find(".trust").val()) {
					trust = cells.eq(j).find(".trust").val();
				} else if (cells.eq(j).find(".luck").val()) {
					luck = cells.eq(j).find(".luck").val();
				} else if (cells.eq(j).find(".skill").val()) {
					skill = cells.eq(j).find(".skill").val();
				}
			}
			data.push({
				id: id,
				unit_id: unit_id,
				name: unitname,
				status: status,
				evo: evo,
				trust: trust,
				luck: luck,
				skill: skill
			});
		}
		try {
			localStorage.setItem('tmndeck', JSON.stringify(data));
		} catch (e) {
			return false;
		}
		return true;
	}

	var removeData = function() {
		try {
			localStorage.removeItem('tmndeck');
		} catch (e) {
			return false;
		}
		return true;
	}

	var buildStatusBox = function(data_single) {
		var sel = $('<select>');
		sel.attr('id', 'status_' + data_single['id']);
		sel.attr('class', 'custom-select custom-select-sm status');
		sel.attr('data-width', 'auto');
		sel.append($("<option>").val("max").text("育成完了"));
		sel.append($("<option>").val("grow").text("育成中"));
		sel.append($("<option>").val("wait").text("待機中"));
		sel.append($("<option>").val("wish").text("欲しい！"));
		sel.append($("<option>").val("none").text("-"));

		if (data_single['status']) {
			sel.val(data_single['status']);
		} else {
			sel.val("none");
		}

		return sel;
	}

	var buildEvoBox = function(data_single) {
		var sel = $('<select>');
		sel.attr('id', 'evo_' + data_single['id']);
		sel.attr('class', 'custom-select custom-select-sm evo');
		sel.append($("<option>").attr("selected", "selected").val("0").text("0"));
		sel.append($("<option>").val("1").text("1"));
		sel.append($("<option>").val("2").text("2"));

		if (data_single['evo']) {
			if (!isNaN(data_single['evo']) && data_single['evo'] > 2) {
				sel.val("2");
			} else if (!isNaN(data_single['evo']) && data_single['evo'] < 0) {
				sel.val("0");
			} else {
				sel.val(data_single['evo']);
			}
		} else {
			sel.val("0");
		}

		switch (data_single['status']) {
			case 'max':
			case 'wish':
			case 'none':
				sel.attr('disabled', 'disabled');
				break;
		}

		return sel;
	}

	var buildTrustBox = function(data_single) {
		var sel = $('<select>');
		sel.attr('id', 'trust_' + data_single['id']);
		sel.attr('class', 'custom-select custom-select-sm trust');
		sel.append($("<option>").attr("selected", "selected").val("0").text("0"));
		sel.append($("<option>").val("1").text("1"));
		sel.append($("<option>").val("2").text("2"));
		sel.append($("<option>").val("3").text("3"));

		if (data_single['trust']) {
			if (!isNaN(data_single['trust']) && data_single['trust'] > 3) {
				sel.val("3");
			} else if (!isNaN(data_single['trust']) && data_single['trust'] < 0) {
				sel.val("0");
			} else {
				sel.val(data_single['trust']);
			}
		} else {
			sel.val("0");
		}

		switch (data_single['status']) {
			case 'max':
			case 'wish':
			case 'none':
				sel.attr('disabled', 'disabled');
				break;
		}

		return sel;
	}

	var buildSkillBox = function(data_single) {
		var sel = $('<select>');
		sel.attr('id', 'skill_' + data_single['id']);
		sel.attr('class', 'custom-select custom-select-sm skill');
		for (var i = 0; i <= 5; i++) {
			sel.append($("<option>").val(i).text(i));
		}

		if (data_single['skill']) {
			if (!isNaN(data_single['skill']) && data_single['skill'] > 5) {
				sel.val("5");
			} else if (!isNaN(data_single['skill']) && data_single['skill'] < 0) {
				sel.val("0");
			} else {
				sel.val(data_single['skill']);
			}
		} else {
			sel.val("0");
		}

		switch (data_single['status']) {
			case 'wish':
			case 'none':
				sel.attr('disabled', 'disabled');
				break;
		}

		return sel;
	}

	var buildLuckBox = function(data_single) {
		var maxLuck = 100;
		switch (data_single['rarity']) {
			case 'HR':
				maxLuck = 90;
				break;
			case 'R':
				maxLuck = 80;
				break;
			default:
				maxLuck = 100;
				break;
		}
		var sel = $('<select>');
		sel.attr('id', 'luck_' + data_single['id']);
		sel.attr('class', 'custom-select custom-select-sm luck');
		for (var i = 0; i <= maxLuck; i++) {
			sel.append($("<option>").val(i).text(i));
		}

		if (data_single['luck']) {
			if (!isNaN(data_single['luck']) && data_single['luck'] > maxLuck) {
				sel.val("100");
			} else if (!isNaN(data_single['luck']) && data_single['luck'] < 0) {
				sel.val("0");
			} else {
				sel.val(data_single['luck']);
			}
		} else {
			sel.val("0");
		}

		switch (data_single['status']) {
			case 'wish':
			case 'none':
				sel.attr('disabled', 'disabled');
				break;
		}

		return sel;
	}

	var buildSortSelect = function(option) {
		var sel = $('<select>');
		sel.attr('id', 'select_sort');
		sel.attr('class', 'custom-select float-right');
		sel.append($("<option>").val("id").text("実装順"));
		sel.append($("<option>").val("rarity").text("レアリティ順"));
		sel.append($("<option>").val("attribute").text("属性順"));

		sel.val(option);

		return sel;
	}

	var EvoItems = class {
		constructor() {
			this.superman = {
				piece: 0,
				drop: 0,
				gem: 0,
				pyroxene: 0
			};
			this.magic = {
				piece: 0,
				drop: 0,
				gem: 0,
				pyroxene: 0
			};
			this.spirit = {
				piece: 0,
				drop: 0,
				gem: 0,
				pyroxene: 0
			};
			this.nature = {
				piece: 0,
				drop: 0,
				gem: 0,
				pyroxene: 0
			};
			this.science = {
				piece: 0,
				drop: 0,
				gem: 0,
				pyroxene: 0
			};
			this.origin = 0;
			this.mystery = 0;
			this.pirce_hero = 0;
			this.decisive_item = 0;
		}

		add(a) {
			if (a instanceof EvoItems) {
				this.superman.piece += a.superman.piece;
				this.superman.drop += a.superman.drop;
				this.superman.gem += a.superman.gem;
				this.superman.pyroxene += a.superman.pyroxene;
				this.magic.piece += a.magic.piece;
				this.magic.drop += a.magic.drop;
				this.magic.gem += a.magic.gem;
				this.magic.pyroxene += a.magic.pyroxene;
				this.spirit.piece += a.spirit.piece;
				this.spirit.drop += a.spirit.drop;
				this.spirit.gem += a.spirit.gem;
				this.spirit.pyroxene += a.spirit.pyroxene;
				this.nature.piece += a.nature.piece;
				this.nature.drop += a.nature.drop;
				this.nature.gem += a.nature.gem;
				this.nature.pyroxene += a.nature.pyroxene;
				this.science.piece += a.science.piece;
				this.science.drop += a.science.drop;
				this.science.gem += a.science.gem;
				this.science.pyroxene += a.science.pyroxene;
				this.origin += a.origin;
				this.mystery += a.mystery;
				this.pirce_hero += a.pirce_hero;
				this.decisive_item += a.decisive_item;
			}
		}

		sub(a) {
			if (a instanceof EvoItems) {
				this.superman.piece -= a.superman.piece;
				this.superman.drop -= a.superman.drop;
				this.superman.gem -= a.superman.gem;
				this.superman.pyroxene -= a.superman.pyroxene;
				this.magic.piece -= a.magic.piece;
				this.magic.drop -= a.magic.drop;
				this.magic.gem -= a.magic.gem;
				this.magic.pyroxene -= a.magic.pyroxene;
				this.spirit.piece -= a.spirit.piece;
				this.spirit.drop -= a.spirit.drop;
				this.spirit.gem -= a.spirit.gem;
				this.spirit.pyroxene -= a.spirit.pyroxene;
				this.nature.piece -= a.nature.piece;
				this.nature.drop -= a.nature.drop;
				this.nature.gem -= a.nature.gem;
				this.nature.pyroxene -= a.nature.pyroxene;
				this.science.piece -= a.science.piece;
				this.science.drop -= a.science.drop;
				this.science.gem -= a.science.gem;
				this.science.pyroxene -= a.science.pyroxene;
				this.origin -= a.origin;
				this.mystery -= a.mystery;
				this.pirce_hero -= a.pirce_hero;
				this.decisive_item -= a.decisive_item;
			}
		}
	};

	var calcEvoItem = function(data, status, constant) {
		if (data == null) {
			return null;
		}
		var evoitems = new EvoItems();
		var evoitemat = null;

		for (var i = 0; i < data.length; i++) {
			if (constant && data[i]['limited'] != '') {
				if (data[i]['status'] != 'grow' && data[i]['status'] != 'wait') {
					continue;
				}
			}
			switch (data[i]['attribute']) {
				case "超人":
					evoitemat = evoitems.superman;
					break;
				case "魔性":
					evoitemat = evoitems.magic;
					break;
				case "精神":
					evoitemat = evoitems.spirit;
					break;
				case "自然":
					evoitemat = evoitems.nature;
					break;
				case "科学":
					evoitemat = evoitems.science;
					break;
			}

			if (data[i]['status'] == status) {
				switch (data[i]['rarity']) {
					case 'R':
						if (data[i]['evo'] == 0) {
							evoitemat.piece += 25;
							evoitemat.drop += 10;
						} else if (data[i]['evo'] == 1) {
							evoitemat.piece += 10;
							evoitemat.drop += 10;
						}
						break;
					case 'HR':
						if (data[i]['evo'] == 0) {
							evoitemat.piece += 15;
							evoitemat.drop += 25;
							evoitemat.gem += 5;
						} else if (data[i]['evo'] == 1) {
							evoitemat.piece += 5;
							evoitemat.drop += 15;
							evoitemat.gem += 5;
						}
						break;
					case 'SR':
						if (data[i]['limited'] == '決戦ユニット') {
							if (data[i]['evo'] == 0) {
								evoitemat.piece += 50;
								evoitemat.drop += 25;
								evoitemat.gem += 25;
								evoitemat.pyroxene += 40;
								evoitems.pirce_hero += 80;
							} else if (data[i]['evo'] == 1) {
								evoitemat.pyroxene += 30;
								evoitems.pirce_hero += 50;
							}
							evoitems.mystery += 5;
							evoitems.origin += 10;
							evoitems.decisive_item += 10;
							break;
						}
						if (data[i]['evo'] == 0) {
							evoitemat.piece += 5;
							evoitemat.drop += 25;
							evoitemat.gem += 20;
							if (data[i]['limited'] == 'イベント配布') {
								evoitems.mystery += 3;
							}
							evoitems.origin += 4;
						} else if (data[i]['evo'] == 1) {
							evoitemat.drop += 10;
							evoitemat.gem += 15;
							if (data[i]['limited'] == 'イベント配布') {
								evoitems.mystery += 2;
							}
							evoitems.origin += 4;
						}
						break;
				}
			}
		}
		return evoitems;
	}

	var buildEvoItemTable = function(data) {
		if (data == null) {
			return null;
		}
		var evoitem = calcEvoItem(data, 'grow', false);
		var evoitem_wait = calcEvoItem(data, 'wait', false);
		evoitem.add(evoitem_wait);

		var table = $('<table class="table table-bordered"></table>');
		var thead = $('<thead><tr><th>-</th><th class="超人">超人</th><th class="魔性">魔性</th><th class="精神">精神</th><th class="自然">自然</th><th class="科学">科学</th><th>原初／神秘</th></tr></thead>');
		var tbody = $('<tbody></tbody>');

		var row = $("<tr></tr>");
		row.append("<td>欠片</td>" + "<td>" + evoitem.superman.piece + "</td>" + "<td>" + evoitem.magic.piece + "</td>" + "<td>" + evoitem.spirit.piece + "</td>" + "<td>" + evoitem.nature.piece + "</td>" + "<td>" + evoitem.science.piece + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>雫</td>" + "<td>" + evoitem.superman.drop + "</td>" + "<td>" + evoitem.magic.drop + "</td>" + "<td>" + evoitem.spirit.drop + "</td>" + "<td>" + evoitem.nature.drop + "</td>" + "<td>" + evoitem.science.drop + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>宝珠</td>" + "<td>" + evoitem.superman['gem'] + "</td>" + "<td>" + evoitem.magic.gem + "</td>" + "<td>" + evoitem.spirit.gem + "</td>" + "<td>" + evoitem.nature.gem + "</td>" + "<td>" + evoitem.science.gem + "</td>" + "<td>" + evoitem.origin + "／" + evoitem.mystery + "</td>");
		tbody.append(row);

		table.append(thead);
		table.append(tbody);

		return table;
	}

	var buildEvoItemTableConstantAll = function(data) {
		if (data == null) {
			return null;
		}
		var evoitem = calcEvoItem(data, 'grow', true);
		evoitem.add(calcEvoItem(data, 'wait', true));
		evoitem.add(calcEvoItem(data, 'wish', true));
		evoitem.add(calcEvoItem(data, 'none', true));

		var table = $('<table class="table table-bordered"></table>');
		var thead = $('<thead><tr><th>-</th><th class="超人">超人</th><th class="魔性">魔性</th><th class="精神">精神</th><th class="自然">自然</th><th class="科学">科学</th><th>原初／神秘</th></tr></thead>');
		var tbody = $('<tbody></tbody>');

		var row = $("<tr></tr>");
		row.append("<td>欠片</td>" + "<td>" + evoitem.superman.piece + "</td>" + "<td>" + evoitem.magic.piece + "</td>" + "<td>" + evoitem.spirit.piece + "</td>" + "<td>" + evoitem.nature.piece + "</td>" + "<td>" + evoitem.science.piece + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>雫</td>" + "<td>" + evoitem.superman.drop + "</td>" + "<td>" + evoitem.magic.drop + "</td>" + "<td>" + evoitem.spirit.drop + "</td>" + "<td>" + evoitem.nature.drop + "</td>" + "<td>" + evoitem.science.drop + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>宝珠</td>" + "<td>" + evoitem.superman['gem'] + "</td>" + "<td>" + evoitem.magic.gem + "</td>" + "<td>" + evoitem.spirit.gem + "</td>" + "<td>" + evoitem.nature.gem + "</td>" + "<td>" + evoitem.science.gem + "</td>" + "<td>" + evoitem.origin + "／" + evoitem.mystery + "</td>");
		tbody.append(row);

		table.append(thead);
		table.append(tbody);

		return table;
	}

	var buildEvoItemTableAll = function(data) {
		if (data == null) {
			return null;
		}
		var evoitem = calcEvoItem(data, 'grow', false);
		evoitem.add(calcEvoItem(data, 'wait', false));
		evoitem.add(calcEvoItem(data, 'wish', false));
		evoitem.add(calcEvoItem(data, 'none', false));

		var table = $('<table class="table table-bordered"></table>');
		var thead = $('<thead><tr><th>-</th><th class="超人">超人</th><th class="魔性">魔性</th><th class="精神">精神</th><th class="自然">自然</th><th class="科学">科学</th><th>原初／神秘</th></tr></thead>');
		var tbody = $('<tbody></tbody>');

		var row = $("<tr></tr>");
		row.append("<td>欠片</td>" + "<td>" + evoitem.superman.piece + "</td>" + "<td>" + evoitem.magic.piece + "</td>" + "<td>" + evoitem.spirit.piece + "</td>" + "<td>" + evoitem.nature.piece + "</td>" + "<td>" + evoitem.science.piece + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>雫</td>" + "<td>" + evoitem.superman.drop + "</td>" + "<td>" + evoitem.magic.drop + "</td>" + "<td>" + evoitem.spirit.drop + "</td>" + "<td>" + evoitem.nature.drop + "</td>" + "<td>" + evoitem.science.drop + "</td><td></td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>宝珠</td>" + "<td>" + evoitem.superman['gem'] + "</td>" + "<td>" + evoitem.magic.gem + "</td>" + "<td>" + evoitem.spirit.gem + "</td>" + "<td>" + evoitem.nature.gem + "</td>" + "<td>" + evoitem.science.gem + "</td>" + "<td>" + evoitem.origin + "／" + evoitem.mystery + "</td>");
		tbody.append(row);

		table.append(thead);
		table.append(tbody);

		return table;
	}

	var buildWishList = function(data) {
		if (data == null) {
			return null;
		}
		var table = $('<table class="table table-bordered table-hover"></table>');
		var thead = $("<thead><tr><th>ユニット名</th><th>レア</th><th>限定</th><th>確率</th><th>100連確率</th></tr></thead>");

		var tbody = $("<tbody></tbody>");
		$.each(data, function(index, elem) {
			if (elem.status == 'wish') {
				var row = $('<tr>');
				row.append('<td class="' + elem.attribute + '">' + elem.name + '</td>');
				row.append('<td>' + elem.rarity + '</td>');
				row.append('<td class="' + elem.limited + '">' + elem.limited + '</td>');
				if (elem.limited == '' || elem.limited == '恒常') {
					var lot = 0;
					switch (elem.rarity) {
						case 'SR':
							row.append('<td>' + Math.floor(rot_sr * 10000.0) / 100.0 + '％</td>');
							lot = 1.0 - Math.pow((100.0 - rot_sr * 100.0) / 100.0, 100);
							row.append('<td>' + Math.floor(lot * 10000.0) / 100.0 + '％</td>');
							break;
						case 'HR':
							row.append('<td>' + Math.floor(rot_hr * 10000.0) / 100.0 + '％</td>');
							lot = 1.0 - Math.pow((100.0 - rot_hr * 100.0) / 100.0, 100);
							row.append('<td>' + Math.floor(lot * 10000.0) / 100.0 + '％</td>');
							break;
						case 'R':
							row.append('<td>' + Math.floor(rot_r * 10000.0) / 100.0 + '％</td>');
							lot = 1.0 - Math.pow((100.0 - rot_r * 100.0) / 100.0, 100);
							row.append('<td>' + Math.floor(lot * 10000.0) / 100.0 + '％</td>');
							break;
						default:
							row.append('<td>');
							row.append('<td>');
					}
				} else {
					row.append('<td>');
					row.append('<td>');
				}
				tbody.append(row);
			}
		})
		table.append(thead);
		table.append(tbody);
		return table;
	}

	var buildUnitOverViewList = function(data, constant) {
		var array_sum = function(ary) {
			return ary.reduce(function(accu, current, i, ary) {
				return accu + current;
			});
		}

		if (data == null) {
			return null;
		}

		var own_sr = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};
		var own_hr = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};
		var own_r = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};
		var all_sr = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};
		var all_hr = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};
		var all_r = {
			"超人": 0,
			"魔性": 0,
			"精神": 0,
			"自然": 0,
			"科学": 0,
			"合計": 0
		};

		for (var i = 0; i < data.length; i++) {
			if (constant && data[i]['limited'] != '') {
				continue;
			}
			switch (data[i]['rarity']) {
				case 'SR':
					if (data[i]['status'] == 'max' || data[i]['status'] == 'grow' || data[i]['status'] == 'wait') {
						own_sr[data[i]['attribute']] += 1;
						own_sr['合計'] += 1;
					}
					all_sr[data[i]['attribute']] += 1;
					all_sr['合計'] += 1;
					break;
				case 'HR':
					if (data[i]['status'] == 'max' || data[i]['status'] == 'grow' || data[i]['status'] == 'wait') {
						own_hr[data[i]['attribute']] += 1;
						own_hr['合計'] += 1;
					}
					all_hr[data[i]['attribute']] += 1;
					all_hr['合計'] += 1;
					break;
				case 'R':
					if (data[i]['status'] == 'max' || data[i]['status'] == 'grow' || data[i]['status'] == 'wait') {
						own_r[data[i]['attribute']] += 1;
						own_r['合計'] += 1;
					}
					all_r[data[i]['attribute']] += 1;
					all_r['合計'] += 1;
					break;
			}
		}

		var table = $('<table class="table table-bordered"></table>');
		var thead = $('<thead><tr><th>-</th><th class="超人">超人</th><th class="魔性">魔性</th><th class="精神">精神</th><th class="自然">自然</th><th class="科学">科学</th><th>合計</th></tr></thead>');
		var tbody = $('<tbody></tbody>');

		var row = $("<tr></tr>");
		row.append("<td>SR</td>" +
			"<td>" + own_sr['超人'] + "/" + all_sr['超人'] + "</td>" +
			"<td>" + own_sr['魔性'] + "/" + all_sr['魔性'] + "</td>" +
			"<td>" + own_sr['精神'] + "/" + all_sr['精神'] + "</td>" +
			"<td>" + own_sr['自然'] + "/" + all_sr['自然'] + "</td>" +
			"<td>" + own_sr['科学'] + "/" + all_sr['科学'] + "</td>" +
			"<td>" + own_sr['合計'] + "/" + all_sr['合計'] + "</td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>HR</td>" +
			"<td>" + own_hr['超人'] + "/" + all_hr['超人'] + "</td>" +
			"<td>" + own_hr['魔性'] + "/" + all_hr['魔性'] + "</td>" +
			"<td>" + own_hr['精神'] + "/" + all_hr['精神'] + "</td>" +
			"<td>" + own_hr['自然'] + "/" + all_hr['自然'] + "</td>" +
			"<td>" + own_hr['科学'] + "/" + all_hr['科学'] + "</td>" +
			"<td>" + own_hr['合計'] + "/" + all_hr['合計'] + "</td>");
		tbody.append(row);
		row = $("<tr></tr>");
		row.append("<td>R</td>" +
			"<td>" + own_r['超人'] + "/" + all_r['超人'] + "</td>" +
			"<td>" + own_r['魔性'] + "/" + all_r['魔性'] + "</td>" +
			"<td>" + own_r['精神'] + "/" + all_r['精神'] + "</td>" +
			"<td>" + own_r['自然'] + "/" + all_r['自然'] + "</td>" +
			"<td>" + own_r['科学'] + "/" + all_r['科学'] + "</td>" +
			"<td>" + own_r['合計'] + "/" + all_r['合計'] + "</td>");
		tbody.append(row);

		table.append(thead);
		table.append(tbody);

		return table;
	}

	var buildTrainingTable = function(data) {
		var table = $('<table class="table table-bordered"></table>');
		var thead = $('<thead><tr><th>育成完了</th><th>育成中</th><th>待機中</th><th>欲しい！</th><th>未所有</th></tr></thead>');
		var tbody = $('<tbody></tbody>');

		var personal_status = {
			"max": 0,
			"grow": 0,
			"wait": 0,
			"wish": 0,
			"none": 0
		};

		for (var i = 0; i < data.length; i++) {
			if (data[i].status === '') {
				personal_status.none++;
				continue;
			}
			personal_status[data[i].status]++;
		}

		var row = $("<tr></tr>");
		row.append("<td>" + personal_status.max + "</td>" + "<td>" + personal_status.grow + "</td>" + "<td>" + personal_status.wait + "</td>" + "<td>" + personal_status.wish + "</td>" + "<td>" + personal_status.none + "</td>");
		tbody.append(row);

		table.append(thead);
		table.append(tbody);

		return table;
	}

	var buildAnalyzeContainer = function(data) {
		var container = $('<div id="AnalyzeContainer"></div>');
		var groupRot = $('<div class="form-group"></div>');
		var formrowRot = $('<div class="form-row px-4"></div>');
		var labelRot = $('<label for="user_rot_number">確率を追加できます（％）</label>');
		var inputRot = $('<input type="number" name="user_rot_number" id="user_rot_number" class="form-control col" min="0" max="100" step="0.01" value="0.01">');
		var buttonRot = $('<button class="btn btn-primary col" id="user_rot_button">確率を追加</button>');
		var groupTimes = $('<div class="form-group"></div>');
		var formrowTimes = $('<div class="form-row px-4"></div>');
		var labelTimes = $('<label for="user_times_number">最大回数を指定できます（10回以下切り捨て、500回まで）</label>');
		var inputTimes = $('<input type="number" name="user_times_number" id="user_times_number" class="form-control col" min="0" max="500" step="10" value="100">');
		var buttonTimes = $('<button class="btn btn-primary col" id="user_times_button">最大回数を指定</button>');
		var canvas = $('<canvas id="RotChart"></canvas>');
		formrowRot.append(inputRot);
		formrowRot.append(buttonRot);
		groupRot.append(labelRot);
		groupRot.append(formrowRot);
		container.append(canvas);
		container.append(groupRot);
		formrowTimes.append(inputTimes);
		formrowTimes.append(buttonTimes);
		groupTimes.append(labelTimes);
		groupTimes.append(formrowTimes);
		container.append(groupTimes);

		return container;
	}

	var drawRotChart = function() {
		var canvas = $('#RotChart');
		canvas.empty();

		var calcrot = function(rot_single, times) {
			return 1.0 - Math.pow((100.0 - rot_single * times) / 100.0, 100);
		}

		var maxtimes = times_user;

		if (maxtimes < 0 ) {
			maxtimes = 0;
		} else if (maxtimes > 500) {
			maxtimes = 500;
		}

		var datapoints_r = [];
		var datapoints_hr = [];
		var datapoints_sr = [];
		for (var i = 0; i <= maxtimes; i += 10) {
			datapoints_r.push(Math.floor(calcrot(rot_r, i) * 10000.0) / 100.0);
			datapoints_hr.push(Math.floor(calcrot(rot_hr, i) * 10000.0) / 100.0);
			datapoints_sr.push(Math.floor(calcrot(rot_sr, i) * 10000.0) / 100.0);
		}

		var datasets = null;
		var labels = [];
		for (var i = 0; i <= maxtimes; i += 10) {
			labels.push(i);
		}

		if (rot_user != 0) {
			var datapoints_user = [];
			for (var i = 0; i <= maxtimes; i += 10) {
				datapoints_user.push(Math.floor(calcrot(rot_user, i) * 10000.0) / 100.0);
			}
			datasets = [{
				label: 'SRピックアップ無' + (Math.floor(rot_sr * 10000.0) / 100.0).toString() + '％',
				data: datapoints_sr,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}, {
				label: 'HRピックアップ無' + (Math.floor(rot_hr * 10000.0) / 100.0).toString() + '％',
				data: datapoints_hr,
				borderColor: 'rgb(255, 159, 64)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}, {
				label: 'Rピックアップ無' + (Math.floor(rot_r * 10000.0) / 100.0).toString() + '％',
				data: datapoints_r,
				borderColor: 'rgb(54, 162, 235)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}, {
				label: '指定確率' + (Math.floor(rot_user * 10000.0) / 100.0).toString() + '％',
				data: datapoints_user,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}];
		} else {
			datasets = [{
				label: 'SRピックアップ無' + (Math.floor(rot_sr * 10000.0) / 100.0).toString() + '％',
				data: datapoints_sr,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}, {
				label: 'HRピックアップ無' + (Math.floor(rot_hr * 10000.0) / 100.0).toString() + '％',
				data: datapoints_hr,
				borderColor: 'rgb(255, 159, 64)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}, {
				label: 'Rピックアップ無' + (Math.floor(rot_r * 10000.0) / 100.0).toString() + '％',
				data: datapoints_r,
				borderColor: 'rgb(54, 162, 235)',
				backgroundColor: 'rgba(0, 0, 0, 0)',
				fill: false,
			}];
		}

		window.RotChart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: '何回引けばお迎えできるか問題'
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '回数（回）'
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'お迎え確率（％）'
						},
						ticks: {
							suggestedMin: 0,
							suggestedMax: 100,
						}
					}]
				}
			}
		});
		window.RotChart.update();
	}

	var renderOverview = function(data) {
		if (data == null) {
			return;
		}
		var overview = $("#overview");
		overview.empty();

		var h2 = $("<h2>概要</h2>");
		var h3 = $("<h3>");
		var table = null;
		var accordion = null;
		var card = null;
		var cardheader = null;
		var collapse = null;
		var cardbody = null;
		var textbody = null;

		accordion = $('<div class="accordion" id="overview_accordion" role="tablist"></div>');

		card = $('<div class="card"></div>');
		cardheader = $('<div class="card-header" id="heading_unitoverview" role="tab"></div>');
		collapse = $('<div class="collapse show" id="collapse_unitoverview" aria-labelledby="heading_unitoverview" data-parent="#overview_accordion"></div>');
		cardbody = $('<div class="card-body"></div>');
		textbody = $('<a class="text-body d-block" href="#collapse_unitoverview" role="button" data-toggle="collapse" aria-controls="collapse_unitoverview"></a>');
		textbody.text("ユニット");

		table = buildUnitOverViewList(data, false);

		h3 = $("<h3>");
		h3.append(textbody);
		cardheader.append(h3);
		cardbody.append('<h4>所有概要</h4>');
		cardbody.append(table);
		cardbody.append('<p class="small text-muted">所有／実装済み</p>');

		table = buildUnitOverViewList(data, true);

		h3 = $("<h3>");
		h3.append(textbody);
		cardheader.append(h3);
		cardbody.append('<h4>所有概要（恒常のみ）</h4>');
		cardbody.append(table);
		cardbody.append('<p class="small text-muted">所有／実装済み</p>');

		table = buildTrainingTable(data);
		cardbody.append('<h4>育成概要</h4>');
		cardbody.append(table);

		collapse.append(cardbody);
		card.append(cardheader);
		card.append(collapse);
		accordion.append(card);

		card = $('<div class="card"></div>');
		cardheader = $('<div class="card-header" id="heading_evoitem" role="tab"></div>');
		collapse = $('<div class="collapse" id="collapse_evoitem" aria-labelledby="heading_evoitem" data-parent="#overview_accordion"></div>');
		cardbody = $('<div class="card-body"></div>');
		textbody = $('<a class="text-body d-block" href="#collapse_evoitem" role="button" data-toggle="collapse" aria-controls="collapse_evoitem"></a>');
		textbody.text("必要覚醒素材");

		table = buildEvoItemTable(data);

		h3 = $("<h3>");
		h3.append(textbody);
		cardheader.append(h3);
		cardbody.append('<h4>所有のみ</h4>');
		cardbody.append(table);

		table = buildEvoItemTableConstantAll(data);
		cardheader.append(h3);
		cardbody.append('<h4>所有と恒常の合計</h4>');
		cardbody.append(table);

		table = buildEvoItemTableAll(data);
		cardheader.append(h3);
		cardbody.append('<h4>実装済み全て</h4>');
		cardbody.append(table);
		cardbody.append('<p class="small text-muted">「所有のみ」は「待機中」と「育成中」の合計値となります<br>「所有と恒常の合計」は「所有のみ」と「未所有のプレミアムガチャのユニット」の合計値となります</p>');
		collapse.append(cardbody);
		card.append(cardheader);
		card.append(collapse);
		accordion.append(card);

		card = $('<div class="card"></div>');
		cardheader = $('<div class="card-header" id="heading_wishlist" role="tab"></div>');
		collapse = $('<div class="collapse" id="collapse_wishlist" aria-labelledby="heading_wishlist" data-parent="#overview_accordion"></div>');
		cardbody = $('<div class="card-body"></div>');
		textbody = $('<a class="text-body d-block" href="#collapse_wishlist" role="button" data-toggle="collapse" aria-controls="collapse_wishlist"></a>');
		textbody.text("ウィッシュリスト");

		h3 = $("<h3>");
		h3.append(textbody);
		table = buildWishList(data);
		cardheader.append(h3);
		cardbody.append(table);
		cardbody.append('<p class="small text-muted">確率はピックアップ無しのプレミアムガチャ換算。確定枠を除くため110連換算はしません</p>');
		collapse.append(cardbody);
		card.append(cardheader);
		card.append(collapse);
		accordion.append(card);

		card = $('<div class="card"></div>');
		cardheader = $('<div class="card-header" id="heading_analyze" role="tab"></div>');
		collapse = $('<div class="collapse" id="collapse_analyze" aria-labelledby="heading_analyze" data-parent="#overview_accordion"></div>');
		cardbody = $('<div class="card-body"></div>');
		textbody = $('<a class="text-body d-block" href="#collapse_analyze" role="button" data-toggle="collapse" aria-controls="collapse_analyze"></a>');
		textbody.text("分析");

		h3 = $("<h3>");
		h3.append(textbody);
		table = buildAnalyzeContainer(data);
		cardheader.append(h3);
		cardbody.append('<h4>お迎え確率</h4>');
		cardbody.append(table);
		cardbody.append('<p class="small text-muted">ピックアップ無しの確率はプレミアムガチャの確率です</p>');
		collapse.append(cardbody);
		card.append(cardheader);
		card.append(collapse);
		accordion.append(card);

		overview.append(h2);
		overview.append(accordion);
		overview.append($('<hr>'));
	}

	var sortData = function(data, option) {
		if (data == null) {
			return;
		}

		var sort_id = function(a, b) {
			if (a.id > b.id) return 1;
			if (a.id < b.id) return -1;
			return 0;
		}

		var sort_rarity = function(a, b) { //レアリティ→ID
			var aa = 0,
				bb = 0;
			switch (a.rarity) {
				case 'SR':
					aa = 500;
					break;
				case 'HR':
					aa = 300;
					break;
				case 'R':
					aa = 100;
					break;
			}
			switch (b.rarity) {
				case 'SR':
					bb = 500;
					break;
				case 'HR':
					bb = 300;
					break;
				case 'R':
					bb = 100;
					break;
			}
			if (aa < bb) return 1;
			if (aa > bb) return -1;
			return sort_id(a, b);
		}

		var sort_attribute = function(a, b) { //属性→レアリティ→ID
			var aa = 0,
				bb = 0;
			switch (a.attribute) {
				case '超人':
					aa = 500;
					break;
				case '魔性':
					aa = 400;
					break;
				case '精神':
					aa = 300;
					break;
				case '自然':
					aa = 200;
					break;
				case '科学':
					aa = 100;
					break;
			}
			switch (b.attribute) {
				case '超人':
					bb = 500;
					break;
				case '魔性':
					bb = 400;
					break;
				case '精神':
					bb = 300;
					break;
				case '自然':
					bb = 200;
					break;
				case '科学':
					bb = 100;
					break;
			}
			if (aa < bb) return 1;
			if (aa > bb) return -1;
			return sort_rarity(a, b);
		}

		switch (option) {
			case 'id':
				data.sort(sort_id);
				break;
			case 'rarity':
				data.sort(sort_rarity);
				break;
			case 'attribute':
				data.sort(sort_attribute);
				break;
		}
	}

	var renderUnitTable = function(data) {
		if (data == null) {
			return;
		}
		var unittable = $("#unittable");
		unittable.empty();

		var header = $('<div>');
		header.attr('class', 'row mb-2');
		var title = $('<div>');
		title.attr('class', 'col-sm-8');

		var h2 = $('<h2>所有ユニット管理</h2>');
		title.append(h2);

		var sort_wrap = $('<div>');
		sort_wrap.attr('class', 'col-sm-4');
		var sort_select = buildSortSelect(sort_option);
		sort_wrap.append(sort_select);

		sortData(data, sort_select.val());

		header.append(title);
		header.append(sort_wrap);

		unittable.append(header);

		header = $('<div>');
		header.attr('class', 'row m-2');
		var swUnowned;
		var swMaxed;
		if (hideUnowned) {
			swUnowned = $('<div class="custom-control custom-switch col-sm-6"><input type="checkbox" class="custom-control-input" id="hideUnownedSwitch" checked><label class="custom-control-label" for="hideUnownedSwitch">未所有のユニットを隠す</label></div>');
		} else {
			swUnowned = $('<div class="custom-control custom-switch col-sm-6"><input type="checkbox" class="custom-control-input" id="hideUnownedSwitch"><label class="custom-control-label" for="hideUnownedSwitch">未所有のユニットを隠す</label></div>');
		}

		header.append(swUnowned);

		if (hideMaxed) {
			swMaxed = $('<div class="custom-control custom-switch col-sm-6"><input type="checkbox" class="custom-control-input" id="hideMaxedSwitch" checked><label class="custom-control-label" for="hideMaxedSwitch">育成完了のユニットを隠す</label></div>');
		} else {
			swMaxed = $('<div class="custom-control custom-switch col-sm-6"><input type="checkbox" class="custom-control-input" id="hideMaxedSwitch"><label class="custom-control-label" for="hideMaxedSwitch">育成完了のユニットを隠す</label></div>');
		}
		header.append(swMaxed);

		unittable.append(header);

		var responsive = $('<div>');
		responsive.attr('class', 'table-responsive table-responsive-md');

		var table = $('<table class="table table-hover table-bordered"></table>');
		var thead = $('<thead><tr><th>ユニット名</th><th>レア</th><th><div class="th-status">状態</div></th><th><div class="th-evo">覚醒</div></th><th><div class="th-trust">信頼度</div></th><th><div class="th-skill">スキル</div></th><th><div class="th-luck">ラック</div></th></tr></thead>');
		var tbody = $("<tbody></tbody>");

		var i;
		for (i = 0; i < data.length; i++) {
			if (hideUnowned && (data[i]['status'] == 'wish' || data[i]['status'] == 'none')) {
				continue;
			}
			if (hideMaxed && data[i]['status'] == 'max') {
				continue;
			}
			var row = $('<tr unitid="' + data[i]['unit_id'] + '" charaid="' + data[i]['id'] + '"class="' + data[i]['limited'] + ' ' + data[i]['attribute'] + ' ' +  data[i]['limited'] + '"></tr>');
			row.append('<td><span class="unitname">' + data[i]['name'] + "</span></td>");
			row.append("<td>" + data[i]['rarity'] + "</td>");

			var td =$('<td>');
			td.append(buildStatusBox(data[i]));
			row.append(td);

			td = $('<td>');
			td.append(buildEvoBox(data[i]));
			row.append(td);

			td = $('<td>');
			td.append(buildTrustBox(data[i]));
			row.append(td);

			td = $('<td>');
			td.append(buildSkillBox(data[i]));
			row.append(td);

			td = $('<td>');
			td.append(buildLuckBox(data[i]));
			row.append(td);

			tbody.append(row);
		}
		table.append(thead);
		table.append(tbody);
		responsive.append(table);
		unittable.append(header);
		unittable.append(responsive);
	}

	var update = function() {
		parsonaldata = loadData();
		var molddata = moldData();

		$("#unittable").empty();
		$("#overview").empty();

		$("#unittable").hide();
		$("#overview").hide();

		renderUnitTable(molddata);
		renderOverview(molddata);

		$("#unittable").show(0);
		$("#overview").show(0);
	}

	var init = function() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'js/unit_base.json', true);
		xhr.send(null);
		xhr.onreadystatechange = function() {
			console.log(xhr.statusText);
			if (xhr.readyState === 4 && xhr.status === 200) {
				unitdata = JSON.parse(xhr.responseText);
				$.each(unitdata, function(idx, value) {
					value['name'] = value['nickname'] + value['name'];
					value['name'] = value['name'].replace('　', '');
					value['name'] = value['name'].replace(' ', '');
				})
				update();
			}
		}
		xhr.onerror = function(e) {
			console.error(xhr.statusText);
		}

		parsonaldata = loadData();
	}

	init();

	$(document).on('change', 'select.status', function() {
		var status = $(this).val();
		var evo = $(this).parent().parent().find('.evo');
		var trust = $(this).parent().parent().find('.trust');
		var skill = $(this).parent().parent().find('.skill');
		var luck = $(this).parent().parent().find('.luck');
		if (status === 'max') {
			evo.val(2);
			evo.attr('disabled', 'disabled');
			trust.val(3);
			trust.attr('disabled', 'disabled');
			skill.removeAttr('disabled').focus();
			luck.removeAttr('disabled').focus();
		} else if (status === 'wish' || status === 'none') {
			evo.val(0);
			evo.attr('disabled', 'disabled');
			trust.val(0);
			trust.attr('disabled', 'disabled');
			skill.val(0);
			skill.attr('disabled', 'disabled');
			luck.val(0);
			luck.attr('disabled', 'disabled');
		} else {
			evo.removeAttr('disabled').focus();
			trust.removeAttr('disabled').focus();
			skill.removeAttr('disabled').focus();
			luck.removeAttr('disabled').focus();
		}
	})

	$(document).on('change', '#select_sort', function() {
		sort_option = $(this).val();
		update();
	})

	$('#save_local').on('click', function() {
		if (saveData()) {
			$('#toast_save').toast('show');
		}
		update();
	})

	$('#clear_local').on('click', function() {
		if (removeData()) {
			$('#toast_clear').toast('show');
		}
		update();
	})

	$(document).on('shown.bs.collapse', '#collapse_analyze', function() {
		drawRotChart();
	})

	$(document).on('click', '#user_rot_button', function() {
		rot_user = parseFloat($('#user_rot_number').val() * 0.01);
		drawRotChart();
	})

	$(document).on('click', '#user_times_button', function() {
		times_user = parseInt($('#user_times_number').val());
		drawRotChart();
	})

	$(document).on('change', '#hideUnownedSwitch', function() {
		hideUnowned = $('#hideUnownedSwitch').prop('checked');
		update();
	})

	$(document).on('change', '#hideMaxedSwitch', function() {
		hideMaxed = $('#hideMaxedSwitch').prop('checked');
		update();
	})
})

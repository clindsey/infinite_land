(function(){
  var paper,
      universe_seed = 19870910;
  jQuery(document).ready(function(){
    var canvas_element = jQuery('#canvas');
    paper = Raphael('canvas',canvas_element.width(),canvas_element.height());
    MainScene();
  });
  var MainScene = function(){
    var zone_manager = ZoneManager(8,8,universe_seed),
        hero = Player(zone_manager,0,0,5,5),
        tile_manager = TileManager(16,hero);
    tile_manager.render();
    jQuery(document).keydown(function(e){
      if(e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40){
        var vx = 0,
            vy = 0,
            map = hero.active_zone.map;
        if(e.keyCode === 37 && (hero.map_x - 1 < 0 || map[hero.map_y][hero.map_x - 1])){
          vx -= 1;
        }
        if(e.keyCode === 38 && (hero.map_y - 1 < 0 || map[hero.map_y - 1][hero.map_x])){
          vy -= 1;
        }
        if(e.keyCode === 39 && (hero.map_x + 1 > map[0].length - 1 || map[hero.map_y][hero.map_x + 1])){
          vx += 1;
        }
        if(e.keyCode === 40 && (hero.map_y + 1 > map.length - 1 || map[hero.map_y + 1][hero.map_x])){
          vy += 1;
        }
        hero.move_by(vx,vy);
        tile_manager.render();
      }
    });
  };
  var TileManager = function(tile_size,hero){
    var self = {},
        width = hero.active_zone.width,
        height = hero.active_zone.height,
        offset_left = (paper.width / 2) - (tile_size / 2),
        offset_top = (paper.height / 2) - (tile_size / 2),
        tile_x,
        tile_y,
        tile,
        tile_set = [];
    for(var i = 0, x, y; i < 9; i += 1){
      tile_set[i] = [];
      for(y = 0; y < height; y += 1){
        tile_set[i][y] = [];
        for(x = 0; x < width; x += 1){
          tile_x = (x - y) * (tile_size / 2) + (paper.width / 2) - (tile_size);
          tile_y = (x + y) * (tile_size / 4) + (paper.height / 4) - (tile_size / 2);
          tile_set[i][y][x] = Tile(tile_x,tile_y,tile_size,1);
        }
      }
    }
    self.render = function(){
      var map = hero.active_zone.map,
          local_left = (hero.map_x - hero.map_y) * (tile_size / 2) + (paper.width / 2) - (tile_size),
          local_top = (hero.map_x + hero.map_y) * (tile_size / 4) + (paper.height / 4) - (tile_size / 2);
      var maps = [  hero.active_zones.nw.map,
                    hero.active_zones.n.map,
                    hero.active_zones.ne.map,
                    hero.active_zones.w.map,
                    hero.active_zone.map,
                    hero.active_zones.e.map,
                    hero.active_zones.sw.map,
                    hero.active_zones.s.map,
                    hero.active_zones.se.map];
      draw_chunks(tile_set[0],maps[0],local_left,local_top,0,0 - tile_size * height * 2);
      draw_chunks(tile_set[1],maps[1],local_left,local_top,tile_size * width,0 - tile_size * height);
      draw_chunks(tile_set[2],maps[2],local_left,local_top,tile_size * width * 2,0);

      draw_chunks(tile_set[3],maps[3],local_left,local_top,0 - tile_size * width,0 - tile_size * height);
      draw_chunks(tile_set[4],maps[4],local_left,local_top,0,0,true);
      draw_chunks(tile_set[5],maps[5],local_left,local_top,tile_size * width,tile_size * height);

      draw_chunks(tile_set[6],maps[6],local_left,local_top,0 - tile_size * width * 2,0);
      draw_chunks(tile_set[7],maps[7],local_left,local_top,0 - tile_size * width,tile_size * height);
      draw_chunks(tile_set[8],maps[8],local_left,local_top,0,tile_size * height * 2);
    };
    var draw_chunks = function(tiles,map,local_left,local_top,offset_x,offset_y,show_center){
      var tile,
          f,
          h,
          tile_x,
          tile_y;
      offset_x /= 2;
      offset_y /= 4;
      for(var y = 0, x; y < height; y += 1){
        for(x = 0; x < width; x += 1){
          tile = tiles[y][x];
          tile_x = (x - y) * (tile_size / 2) + (paper.width / 2) - (tile_size) + offset_x;
          tile_y = (x + y) * (tile_size / 4) + (paper.height / 4) - (tile_size / 2) + offset_y;
          tile.x = tile_x - local_left + (paper.width / 2) - (tile_size);
          tile.y = tile_y - local_top + (paper.height / 2) - (tile_size / 2);
          if(map[y][x] <= 52){
            f = 'rgba(0,0,200,1)';
            h = 4;
          }else if(map[y][x] > 52 && map[y][x] <= 62){
            f = 'rgba(200,200,0,1)';
            h = 8;
          }else if(map[y][x] > 62 && map[y][x] <= 78){
            f = 'rgba(0,200,0,1)';
            h = 12;
          }else if(map[y][x] > 78){
            f = 'rgba(230,230,230,1)';
            h = 16;
          }
          if(hero.map_x === x && hero.map_y === y && show_center){
            f = '#880000';
            h += 4;
          }
          tile.fill = f;
          tile.height = h;
          tile.render();
        }
      }
    };
    return self;
  };
  var Player = function(zone_manager,zone_x,zone_y,map_x,map_y){
    var self = {};
    self.active_zone;
    self.zone_x = zone_x;
    self.zone_y = zone_y;
    self.map_x = map_x;
    self.map_y = map_y;
    self.active_zone = zone_manager.get_zone(self.zone_x,self.zone_y);
    self.active_zones = { 'nw':zone_manager.get_zone(self.zone_x - 1,self.zone_y - 1),
                          'n' :zone_manager.get_zone(self.zone_x + 0,self.zone_y - 1),
                          'ne':zone_manager.get_zone(self.zone_x + 1,self.zone_y - 1),
                          'w' :zone_manager.get_zone(self.zone_x - 1,self.zone_y + 0),
                          'e' :zone_manager.get_zone(self.zone_x + 1,self.zone_y + 0),
                          'sw':zone_manager.get_zone(self.zone_x - 1,self.zone_y + 1),
                          's' :zone_manager.get_zone(self.zone_x + 0,self.zone_y + 1),
                          'se':zone_manager.get_zone(self.zone_x + 1,self.zone_y + 1)};
    self.move_by = function(vx,vy){
      self.map_x += vx;
      self.map_y += vy;
      if(self.map_x < 0 || self.map_x > self.active_zone.width - 1 || self.map_y < 0 || self.map_y > self.active_zone.height - 1){
        if(self.map_x < 0){
          self.zone_x -= 1;
          self.map_x = self.active_zone.width - 1;
        }else if(self.map_x > self.active_zone.width - 1){
          self.zone_x += 1;
          self.map_x = 0;
        }else if(self.map_y < 0){
          self.zone_y -= 1;
          self.map_y = self.active_zone.height - 1;
        }else if(self.map_y > self.active_zone.height - 1){
          self.zone_y += 1;
          self.map_y = 0;
        }
        self.active_zone = zone_manager.get_zone(self.zone_x,self.zone_y);
        self.active_zones = { 'nw':zone_manager.get_zone(self.zone_x - 1,self.zone_y - 1),
                              'n' :zone_manager.get_zone(self.zone_x + 0,self.zone_y - 1),
                              'ne':zone_manager.get_zone(self.zone_x + 1,self.zone_y - 1),
                              'w' :zone_manager.get_zone(self.zone_x - 1,self.zone_y + 0),
                              'e' :zone_manager.get_zone(self.zone_x + 1,self.zone_y + 0),
                              'sw':zone_manager.get_zone(self.zone_x - 1,self.zone_y + 1),
                              's' :zone_manager.get_zone(self.zone_x + 0,self.zone_y + 1),
                              'se':zone_manager.get_zone(self.zone_x + 1,self.zone_y + 1)};
      }
    };
    return self;
  };
  var ZoneManager = function(zone_width,zone_height,seed){
    var self = {};
    self.get_zone = function(x,y){
      return Zone(seed,zone_width,zone_height,x,y);
    };
    return self;
  };
  var Zone = function(seed,width,height,nx,ny){
    var self = {},
        range = height,
        c0,
        c1,
        c2,
        c3,
        ht;
    var nw = ~~(new Alea(new Alea(seed + (nx + 0))() + new Alea(seed + (ny + 0))())() * 255),
        ne = ~~(new Alea(new Alea(seed + (nx + 1))() + new Alea(seed + (ny + 0))())() * 255),
        sw = ~~(new Alea(new Alea(seed + (nx + 0))() + new Alea(seed + (ny + 1))())() * 255),
        se = ~~(new Alea(new Alea(seed + (nx + 1))() + new Alea(seed + (ny + 1))())() * 255);
    self.width = width;
    self.height = height;
    self.map = [];
    for(var y = 0, x; y < height; y += 1){
      self.map[y] = [];
      for(x = 0; x < width; x += 1){
        c0 = calculate_height(0,0,x,y,nw,0,range);
        c1 = calculate_height(width - 1,0,x,y,ne,0,range);
        c2 = calculate_height(width - 1,height - 1,x,y,se,0,range);
        c3 = calculate_height(0,height - 1,x,y,sw,0,range);
        ht = ~~((c0 + c1 + c2 + c3 + 127) / 5);
        self.map[y][x] = ht;
      }
    }
    return self;
  };
  var Tile = function(x,y,size,height){
    var self = {},
        old_height,
        old_fill,
        old_x,
        old_y,
        path = paper.path('');
    path.attr('stroke-width',0);
    self.height = height;
    self.fill;
    self.x = x;
    self.y = y;
    self.render = function(){
      if(self.height !== old_height || old_x !== self.x || old_y !== self.y){
        var vertices = [];
        vertices.push((size + self.x) + ',' + (size / 4 - self.height + self.y));
        vertices.push((size + self.x) + ',' + (size / 4 + self.y));
        vertices.push((size / 2 + self.x) + ',' + (size / 2 + self.y));
        vertices.push((0 + self.x) + ',' + (size / 4 + self.y));
        vertices.push((0 + self.x) + ',' + ((size / 4 - self.height) + self.y));
        var path_str = 'M ' + ((size / 2 + self.x) + ',' + (0 - self.height + self.y)) + ' L ' + vertices.join(" ") + ' Z';
        path.attr('path',path_str);
        old_height = self.height;
        old_x = self.x;
        old_y = self.y;
      }
      if(self.fill !== old_fill){
        path.attr('fill',self.fill);
        old_fill = self.fill;
      }
    };
    return self;
  };
  // calculates the distance between two points and selects a coresponding color
  var calculate_height = function(center_x,center_y,x,y,ht_begin,ht_end,range){
    var rb = ht_begin,
        re = ht_end,
        rd = rb - re;
    var dx = center_x - x,
        dy = center_y - y,
        d = Math.sqrt((dx * dx) + (dy * dy)) / range,
        rn = ~~(rb - (rd * d));
    if(rn < re) rn = re;
    return rn;
  };
})();

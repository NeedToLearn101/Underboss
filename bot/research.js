var researchBot = {
    calcReseachCost: function calcReseachCost(level, cost) {
        var res = cost;
        for(var i=1; i<level; i++) {
            if(i < 10) {
                res = Math.ceil(res * 1.5);
            } else if (i < 15) {
                res = Math.ceil(res * 1.71);
            } else if(i == 15) {
                res = Math.ceil(res * 2.7);
            } else if(i <= 20) {
                res = Math.ceil(res * 1.34);
            }
        }
        return res;
    },
    researchLowest: function researchLowest(city) {
        this.trace();
        var lowLevel = {lvl: 1000, pri: 1000, id: ""};
        if(!city) {
            this.debugResearch("No city");
            return;
        }
        if(!city.research) {
            this.debugResearch("Missing research", city);
            return;
        }
        if(!city.neighborhood) {
            this.debugResearch("Missing neighborhood", city);
            return;
        }

        for(var key in this.research) {
            var research = this.research[key];
            var currentResearch = (city.research[key] || 0) + 1;
            var skip = false;

            var req = research.requirement;
            if(req) {
                if(req.city && req.city !== city.type) {
                    this.debugResearch("Skip " + key + " in " + city.name, city);
                    continue;
                }
                if(req.build) {
                    var build = this.findBuildingLevel(req.build, city);
                    this.debugResearch(key + " (" + currentResearch + "/" + (currentResearch - 4) + ") has req " + req.build + " and it is " + build + " (" + (build * 4) + ")", city);

                    if(req.build == "Garage" || req.build == "Workshop" || req.build == "GuardPost") {
                        if(currentResearch >= 20) {
                            build *= 2;
                        } else if(currentResearch <= 5) {
                            build = 5;
                        } else {
                            build *= 3;
                        }
                    } else {
                        build *= 2;
                    }
                    if(build === 0 || (currentResearch > 1 && build <= currentResearch)) {
                        this.debugResearch("skip because " + build + " is less then " + currentResearch, city);
                        continue;
                    }
                }
                if(req.research) {
                    for(var i=0; i<req.research.length; i++) {
                        var r = req.research[i];
                        var resLvl = city.research[r] || 0;
                        var needLevel = currentResearch;
                        if(req.offset) {
                            needLevel += req.offset;
                        }
                        this.debugResearch(key + " has req " + r + " and it is " + resLvl, city);
                        if(resLvl <= needLevel) {
                            this.debugResearch("Skip because " + resLvl + " is less then " + needLevel, city);
                            skip = true;
                            break;
                        }
                    }
                    if(skip) {
                        continue;
                    }
                }
            }

            if(!this.hasResources(city, key, research.cost, currentResearch, this.calcReseachCost)) {
                this.debugResearch("Skip because we can't affort it", city);
                continue;
            }

            if((lowLevel.lvl > currentResearch) ||
               (lowLevel.lvl == currentResearch &&
                lowLevel.pri > this.research[key].priority))
            {
                lowLevel.lvl = currentResearch;
                lowLevel.name = key;
                lowLevel.pri = this.research[key].priority;
            }
        }

        if(lowLevel.lvl != 1000) {
            this.info("Research " + lowLevel.name + " lvl " + lowLevel.lvl, city, "research");
            this.sendCommand("Research " + lowLevel.name + " lvl " + lowLevel.lvl + " in " + city.type,
                             "cities/" + city.id + "/researches.json",
                             "research[research_type]=" + lowLevel.name,
                             city);
            this.addStat("Research", 1);
            city.research[lowLevel.name] = lowLevel.lvl;
        }
    },
    doResearch: function doResearch() {
        this.trace();
        if(!this.cities) {
            this.debugResearch("Cities not ready");
            return;
        }

        for(var i=0; i<this.cities.length; i++) {
            var city = this.cities[i];
            if(city.type == "DoriaAirport") {
                this.debugResearch("Can't research in " + city.type, city);
                continue;
            }

            var canResearch = this.checkCityQueue(city, "research");
            if(canResearch) {
                this.researchLowest(city);
            } else {
                this.debugResearch("Already researching", city);
            }
        }
    }
};
module.exports = researchBot;

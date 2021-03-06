'use strict';
//errorCode : 0 - no error/ 1 - error
var ObjectId = require('mongoose').Types.ObjectId;
var dependencies = {
    dishRepository: null,
    userRepository: null
}

function DishController(dishRepository, userRepository) {
    dependencies.dishRepository = dishRepository;
    dependencies.userRepository = userRepository;
}
// var DishController = function (dishRepository, userRepository) {

//     this.dishRepository = dishRepository;
//     this.userRepository = userRepository;
// }

DishController.prototype.getDishes = function (req, res, next) {

    var conditions = req.where;
    var orderBy = req.options.sort;
    var items = req.options.limit;
    var page = req.options.skip;

    var pathPop = 'likes.users dislikes.users reviews.user';
    var selectPop = 'username _id';
    
    if (conditions.query) {
        dependencies.dishRepository.fullTextSearch(conditions.query, items, page, pathPop, selectPop, function (err, dishes) {
            if (err) {
                next(err);
            } else {
                res.dishes = dishes;
                next();
            }

        });
    } else {
        dependencies.dishRepository.findAll(conditions, orderBy, items, page, pathPop, selectPop, function (err, dishes) {
            if (err) {
                next(err);
            } else {
                res.dishes = dishes;
                next();
            }
        })
    }

}
DishController.prototype.getDish = function (req, res, next) {

    var dishId = req.params.dishId;
    var selectPop = 'username _id';
    var pathPop = 'likes.users dislikes.users reviews.user';

    dependencies.dishRepository.findById(dishId, pathPop, selectPop, function (err, dish) {
        if (err) {
            next(err);
        } else {

            res.dish = dish;
            next();
        }

    });
}
DishController.prototype.getLatestDishes = function (req, res, next) {

    var page = req.options.skip;
    var items = req.options.limit;
    var orderBy = {
        'created_at': -1
    };
    var selectPop = 'username _id';
    var pathPop = 'likes.users dislikes.users reviews.user creator';

    dependencies.dishRepository.findAll({}, orderBy, items, page, pathPop, selectPop, function (err, dishes) {
        if (err) {
            next(err);
        } else {
            res.dishes = dishes;
            next();
        }
    });
}

DishController.prototype.getDishesOfAgent = function (req, res, next) {

    var agentId = req.where.agentId;
    var page = req.options.skip;
    var items = req.options.limit;
    var selectPop = 'username _id';
    var pathPop = 'likes.users dislikes.users reviews.user';
    if (page < 0) {
        page = 0;
    }

    dependencies.userRepository.findOne({
        '_id': agentId
    }, '', '', function (err, agent) {
        if (err) {
            next(err);
        }

        if (agent && agent.isAgent) {
            dependencies.dishRepository
                .findAll({
                    creator: agentId
                }, {
                    created_at: -1
                }, items, page, pathPop, selectPop, function (err, dishes) {
                    if (err) {
                        next(err);
                    } else {

                        res.dishes = dishes;
                        next();
                    }
                })
        } else {
            next();
        }
    })
}

DishController.prototype.addDish = function (req, res, next) {

    var user = req.user;

    var dishProps = req.body;

    dishProps = Object.assign({}, dishProps, {
        creator: user._id
    });

    if (user && user.isAgent) {
        dependencies.dishRepository.create(dishProps, function (err, newDish) {
            if (err) {
                next(err);
            } else {
                //add dish to Agent
                user.dishes.push(newDish._id);
                user.save(function (err) {
                    if (err) {
                        next(err);
                    }
                });
                //response
                res.newDish = newDish;
                next();
            }
        })
    } else {
        next();
    }

};

DishController.prototype.removeDish = function (req, res, next) {

    var user = req.user;
    var dishId = req.params.dishId;
    //remove ref to the dish in User
    if (user && user.isAgent) {
        //Remove dish from database
        dependencies.dishRepository.findByIdAndRemove(dishId, function (err, dish) {
            if (err) {
                next(err);
            }
            let index = user.dishes.indexOf(dishId);
            user.dishes.splice(index, 1);
            user.save((err) => {
                if (err) {
                    next(err);
                } else {
                    //response
                    res.removedDish = dish;
                    next();
                }
            });

        });
    } else {
        next();
    }
}

DishController.prototype.updateDish = function (req, res, next) {

    var dishObj = req.body;
    var dishId = req.params.dishId;
    var user = req.user;

    dishObj.id = dishId;

    if (user && user.isAgent) {
        dependencies.dishRepository.update(dishObj, function (err, dish) {
            if (err) {
                next(err);
            } else {
                res.updatedDish = dish;
                next();
            }
        });
    } else {
        next();
    }
}

module.exports = DishController;
const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = {$menuId: req.params.menuId};
    db.all(sql, values, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });

});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price;
    const menuSql = 'SELECT * FROM Menu where Menu.Id = $menuId';
    const menuValues = {$menuId: req.params.menuId};
    db.get(menuSql, menuValues, (error, menuItems) => {
        if(error) {
            next(error);
        } else {
            if (!name || !description || !inventory || !price) {
                return res.sendStatus(400);
            }

            const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
            'VALUES ($name, $description, $inventory, $price, $menuId)';
            
            const values = {$name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.params.menuId};
            
            db.run(sql, values, function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE MenuItem.Id = ${this.lastID}`, 
                    (error, menuItem) => {
                        res.status(201).send({menuItem: menuItem});
                    });
                }
            });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => { 
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price,
    menuId = req.params.menuId;
    const menuItemSql = 'SELECT * FROM MenuItem where MenuItem.Id = $menuItemId';
    const menuItemValues = {$menuItemId: req.params.menuItemId};
    db.get(menuItemSql, menuItemValues, (error, menuItem) => {
        if (!menuItem) {
            return res.sendStatus(404);
        } else {
            const menuSql = 'SELECT * FROM Menu where Menu.Id = $menuId';
            const menuValues = {$menuId: req.params.menuId};
            db.get(menuSql, menuValues, (error, menu) => {
                if(error) {
                    next(error);
                } else {
                    if (!name || !inventory || !price ) {
                        return res.sendStatus(400);
                    }
                }
        
                const sql = 'UPDATE MenuItem SET name = $name, ' +  
                'description = $description, inventory = $inventory, ' +
                'price = $price, menu_id = $menuId WHERE MenuItem.id = $menuItemId';
                const values = {
                    $name: name,
                    $description: description,
                    $inventory: inventory,
                    $price: price,
                    $menuId: menuId,
                    $menuItemId: req.params.menuItemId
                };
        
                db.run(sql, values, function(error) {
                    if (error) {
                        next(error);                
                    } else {
                        db.get(`SELECT * FROM MenuItem WHERE MenuItem.Id = ${req.params.menuItemId}`,
                            (error, menuItem) => {
                                res.status(200).json({menuItem: menuItem});
                            });
                    }
                });
            });    
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM MenuItem where MenuItem.Id = $menuItemId';
    const menuItemValues = {$menuItemId: req.params.menuItemId};
    db.get(menuItemSql, menuItemValues, (error, menuItem) => {
        if (!menuItem) {
            return res.sendStatus(404);
        } else {
            const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
            const values = {$menuItemId: req.params.menuItemId};

            db.run(sql, values, (error) => {
                if(error) {
                    res.sendStatus(404);
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menuItemsRouter;
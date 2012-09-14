Breweries = new Meteor.Collection("breweries");
/*
{
    name: '',
    description: '',
    location: '',
    url: '',
    booth_number: '',
    beers:[
        {
            brewery_id: '',
            name: '',
            description: '',
            abv: '',
            ibu: '',
            style: '',
            serving_type: ''
        }
    ]
}
 */
Beers = new Meteor.Collection("beers");
/*
{
    brewery_id: '',
    name: '',
    description: '',
    abv: '',
    ibu: '',
    style: '',
    serving_type: ''
}1
 */
Ratings = new Meteor.Collection("ratings");
/*
{
    user_id: '',
    beer_id: '',
    rating: 0,
    comments: '',
}
 */

if (Meteor.is_client) {

    var pageToLoad = window.location.hash;

    if (!pageToLoad) {
        pageToLoad = "brewery_list";
    } else {
        pageToLoad = pageToLoad.slice(1);
    }
    Session.set('page_name', pageToLoad);
    Session.set('brewery_search', null);

    Template.main.page_name = function (page_name) {
        return Session.equals('page_name', page_name);
    };

    Template.main.is_admin = function (user_id) {
        if (!Session.get('user_id')) {
            Session.set('user_id', user_id);
        }
        switch (user_id) {
            case '23089365-dae6-4648-912e-5c7b5589e2e6':
            case '997442c3-ed71-4833-8b41-695a4976b388':
            case '5296f157-c8d2-4cc1-9453-81c60131e93a':  
                return true;
            default:
                return false;
        }
    };

    Template.brewery_info.is_admin = function(user_id) {
        return Template.main.is_admin(user_id);
    };

    Template.main.greeting = function () {
        return "Welcome to abr2012.";
    };

    Template.brewery_list.brewery_search = function () {
        var val = Session.get('brewery_search');
        return (val == null) ? '' : val;
    };

    breweries = function () {
        var query = {};

        var value = Session.get('brewery_search');

        if (value) {
            value = new RegExp('.*' + value + '.*', 'i');
            query = {$or:[
                {"name":value},
                {"description":value}
            ]};
        }

        return Breweries.find(query);
    };

    Template.beer_list.beers = function () {
        var query = {};

        var value = Session.get('filter_beer');

        var byBrewery = Session.get('brewery_id');

        if (value) {
            value = new RegExp('.*' + value + '.*', 'i');
            query = {$or:[
                {"name":value},
                {"description":value},
                {"style":value}
            ]};
        } else if (byBrewery) {
            query = {brewery_id:byBrewery}
        }
        var beers = Beers.find(query).fetch();
        $.each(beers, function () {
            this.rating = Ratings.findOne({beer_id:this._id, user_id:Session.get('user_id')});
        });

        return beers;
    };

    brewery = function() {
        if (Session.get('brewery_id')) {
            return Breweries.findOne({_id: Session.get('brewery_id')});
        }

        return;
    };

    Template.review_list.ratings = function () {
        var query = {};

        var value = Session.get('brewery_search');

        if (value) {
            value = new RegExp('.*' + value + '.*');
            query = {$or:[
                {"name":value},
                { "description":value }
            ]};
        } else {
            query = {
                user_id:Session.get('user_id')
            };
        }

        return Ratings.find(query);
    };

    Template.ratings_info.rated_beer = function (beer_id) {
        var beer = Beers.findOne(beer_id);
        var brewery = Breweries.findOne(beer.brewery_id);

        return beer.name;
    };

    Template.beer_item.beer_rating = function () {

        var query = {
            beer_id:this._id,
            user_id:Session.get('user_id')
        };

        var rating = Ratings.find(query).fetch()

        return rating;
    };

    Template.beer_item.fetch_rating_buttons = function (beer_rating) {
        var buttons = new Array();

        for (i = 1; i <= 10; i++) {
            var active = '';
            if (beer_rating != undefined) {
                active = beer_rating.rating == i ? ' active' : '';
            }
            buttons.push({
                value:i,
                active:active
            })
        }

        return buttons;
    };

    Template.main.events = {
        'click .brewery_edit' :function () {
          Session.set('page_name', 'edit_brewery');
          Session.set('brewery_id', this._id);
        },
        'click .delete':function () {
            Breweries.remove(this._id);
        },
        'click .filter_brewery':function () {

            var filter = $('#filter_brewery').val();

            if (filter != '') {
                Session.set('brewery_search', filter);
            }
            else {
                Session.set('brewery_search', null);
            }
        },
        'click .filter_beer':function () {

            var filter = $('#filter_beer').val();

            if (filter != '') {
                Session.set('filter_beer', filter);
            }
            else {
                Session.set('filter_beer', null);
            }
        },
        'click .page_name_nav':function (event) {
            var target = $(event.target);
            $('.page_name_nav').removeClass('active');
            target.addClass('active');
            Session.set('page_name', target.attr('id'));
            Session.set('brewery_id', null);
        }
    };

    Template.brewery_list.events = {
        'click .brewery_beer_list':function (event) {
            Session.set('page_name', 'beer_list');
            Session.set('brewery_id', $(event.target).data('brewery'));
        }
    };

    Template.add_brewery.events = {
        'click .add':function () {
            var brewery_name = $('#brewery_name').val();
            var brewery_description = $('#brewery_description').val();
            Breweries.insert({name:brewery_name, description:brewery_description });
            $('#brewery_name').val('');
            $('#brewery_description').val('');
            $('#brewery_url').val('');
        }
    };

    Template.edit_brewery.events = {
        'click .save':function () {
            var brewery_name = $('#brewery_name').val();
            var brewery_description = $('#brewery_description').val();
            var brewery_url = $('#brewery_url').val();
            var brewery_location = $('#brewery_location').val();
            var brewery_brewers = $('#brewery_brewers').val();
            var brewery_guild = $('#brewery_guild').val();

            Breweries.update(Session.get("brewery_id"), {$set: 
                {
                    name: brewery_name, 
                    description: brewery_description, 
                    url: brewery_url,
                    location: brewery_location,
                    brewers: brewery_brewers,
                    guild: brewery_guild
                }
            });
        }
    };    

    Template.add_beer.events = {
        'click .add':function () {
            var beer_name = $('#beer_name').val();
            var brewery_id = $('#brewery_select').val();
            console.log(beer_name);
            console.log(brewery_id);
            Beers.insert({name:beer_name, brewery_id:brewery_id });
            $('#beer_name').val('');
        }
    };

    Template.beer_list.events = {
        'click .submit_review':function () {
            var beerId = this._id;
            var $form = $('#beer_' + beerId);
            var comments = $form.find('.review_text').val();
            var rating = $form.find('.rating_button.active').val();
            var userId = Session.get('user_id');

            if (rating == undefined) {
                alert("You need to select a value!");
                return;
            }

            var ratingObj = Ratings.findOne({
                beer_id:beerId,
                user_id:userId
            });

            if (!ratingObj) {
                Ratings.insert({
                    beer_id:beerId,
                    comments:comments,
                    rating:rating,
                    user_id:userId
                });
            } else {
                Ratings.update(
                    ratingObj._id,
                    {$set:{comments:comments, rating:rating}}
                )
            }


            $form.addClass('hidden');
        },
        'click .review_beer':function () {
            var beerId = this._id;
            var $form = $('#beer_' + beerId);
            var $comments = $form.find('.review_text');

            $form.toggleClass('hidden');
        }
    };

}

if (Meteor.is_server) {

    /*
     Meteor.publish('filtered_breweries', function (filter) {
     return Breweries.find({}, {sort: {name: 1}});
     });*/


    Meteor.startup(function () {
        var canModify = function (userId, tasks) {
            return _.all(tasks, function (task) {
                return !task.privateTo || task.privateTo === userId;
            });
        }

        Breweries.allow({
            insert:function () {
                return true;
            }, remove:function () {
                return true;
            }, update:function () {
                return true;
            }
        });

        Beers.allow({
            insert:function () {
                return true;
            }, remove:function () {
                return true;
            }
        });

        Ratings.allow({
            insert:function () {
                return true;
            }, remove:function () {
                return true;
            }, update:function () {
                return true;
            }
        });
        /*
         Todos.allow({
         insert: function () {return true; },
         update: canModify,
         remove: canModify,
         fetch: ['privateTo']
         });

         Lists.allow({
         insert: function () { return true; }
         });*/
        // code to run on server at startup
    });
}

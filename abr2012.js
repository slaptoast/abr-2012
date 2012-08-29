Breweries = new Meteor.Collection("breweries");
/*{ name: 'brewery',
    description: 'herp derp',
    location: 'blah blah',
    url: 'efefefe',
    */
Beers = new Meteor.Collection("beers");
/*
  { name: 'beer',
    description: 'herp derp',
    brewery_id: '1429924-132949123-93933',
    style: marzen
  }
*/
Ratings = new Meteor.Collection("ratings");
/*
  {
    user_id: 1,
    beer_id: 1,
    rating: 9,
    comments: 'hey we have some comments'
  }
*/

Session.set('page_name', 'brewery_list');
Session.set('brewery_search', null);

if (Meteor.is_client) {

  Template.main.page_name = function (page_name) {
    return Session.equals('page_name', page_name);
  }

  Template.main.is_admin = function (user_id) {
    switch (user_id) {
            case '23089365-dae6-4648-912e-5c7b5589e2e6':
            case '997442c3-ed71-4833-8b41-695a4976b388':
                return true;
            default:
                return false;
    }
  }

  Template.main.greeting = function () {
    return "Welcome to abr2012.";
  };

  Template.brewery_list.brewery_search = function () {
    var val = Session.get('brewery_search');
    return (val == null) ? '' : val;
  }

  breweries = function () {
    var query = {};

    var value = Session.get('brewery_search');

    if(value) {
      value = new RegExp('.*' + value + '.*');
      query = {$or : [ {"name": value},  { "description": value }]};
    }

    return Breweries.find(query);
  };

  Template.beer_list.beers = function () {
    var query = {};
/*
    var value = Session.get('beer_search');

    if(value) {
      value = new RegExp('.*' + value + '.*');
      query = {$or : [ {"name": value},  { "description": value }]};
    }*/

    return Beers.find(query);
  };

  Template.main.events = {
    'click .delete' : function () {
        Breweries.remove(this._id);
     },
    'click .filter_brewery' : function () {
      
      var filter = $('#filter_brewery').val();

      if(filter != '')
      {
        Session.set('brewery_search', filter);
      }
      else
      {
        Session.set('brewery_search', null);
      }
    },
    'click .filter_beer' : function () {
      
      var filter = $('#filter_beer').val();

      if(filter != '')
      {
        Session.set('filter_beer', filter);
      }
      else
      {
        Session.set('filter_beer', null);
      }
    },
    'click .page_name_nav' : function (event) {
      var target = $(event.target); 
      $('.page_name_nav').removeClass('active');
      target.addClass('active');
      Session.set('page_name', target.attr('id'));
    }
  };

  Template.add_brewery.events = {
    'click .add' : function () {
        var brewery_name = $('#brewery_name').val();
        var brewery_description = $('#brewery_description').val();
        Breweries.insert( {name: brewery_name, description: brewery_description });
        $('#brewery_name').val('');
        $('#brewery_description').val('');
        $('#brewery_url').val('');
        $('#brewery_phone').val('');
    }
  };

  Template.add_beer.events = {
    'click .add' : function () {
        var beer_name = $('#beer_name').val();
        var brewery_id = $('#brewery_select').val();
        console.log(beer_name);
        console.log(brewery_id);
        Beers.insert( {name: beer_name, brewery_id: brewery_id });
        $('#beer_name').val('');
    }
  };

}

if (Meteor.is_server) {

  /*
  Meteor.publish('filtered_breweries', function (filter) {
    return Breweries.find({}, {sort: {name: 1}});
  });*/


  Meteor.startup(function () {
    var canModify = function(userId, tasks) {
      return _.all(tasks, function(task) {
        return !task.privateTo || task.privateTo === userId;
      });
    }

    Breweries.allow({
      insert: function () {return true;}
      , remove: function () {return true;}
    });

    Beers.allow({
      insert: function () {return true;}
      , remove: function () {return true;}
    });

    Ratings.allow({
      insert: function () {return true;}
      , remove: function () {return true;}
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

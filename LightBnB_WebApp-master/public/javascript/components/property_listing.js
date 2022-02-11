$(() => {
  window.propertyListing = {};
  
  function createListing(property, isReservation) {
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>number_of_bedrooms: ${property.number_of_bedrooms}</li>
            <li>number_of_bathrooms: ${property.number_of_bathrooms}</li>
            <li>parking_spaces: ${property.parking_spaces}</li>
          </ul>
          ${isReservation ? 
            `<p>${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}</p>` 
            : ``}
          <footer class="property-listing__footer">
          
            <div class="property-listing__rating">${Math.round(property.average_rating * 100) / 100}/5 stars</div>
            <div class="property-listing__price">$${property.cost_per_night/100.0}/night</div>
            
          </footer>
          <br>
          <form action="/api/reservations" method="post" id="reservation-form"id="reservation-form" class="reservation-form">
              <h6>Make a Reservation</h6>

              <input hidden type="text" name="property_id" value="${property.id}"></input>
              <div class="reservation-form">
                  <label for="reservation-form__start_date">
                  <input type="date" name="start_date" id="reservation-form__start_date">
              </div>

              <div class="reservation-form">
                  <label for="end_date">
                  <input type="date" name="end_date" id="reservation-form__end_date">
              </div>
              
              <div class="reservation-form">
                  <button>Reserve Now</button>
              </div>
              
            </form>
        </section>
      </article>
    `
  }

  window.propertyListing.createListing = createListing;

  ("#reservation-form").on('submit', function(event) {
    event.preventDefault();

    views_manager.show('none');

    const data = $(this).serialize();
    submitReservation(data)
      .then(() => {
        views_manager.show('newProperty');
      })
      .catch((error) => {
        console.error(error);
        views_manager.show('listings');
      });
  });



});
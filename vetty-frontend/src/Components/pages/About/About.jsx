import React from 'react';
import './About.css';

const About = () => {
  const newTestimonials = [
    {
      image: 'https://images.unsplash.com/photo-1596383924439-4d410af270f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGV0JTIwc2hlbHRlcnxlbnwwfHwwfHx8MA%3D%3D',
      text: "The pet shelter supplies I ordered arrived quickly and were of excellent quality. Vetty is my go-to site!",
      name: 'Linda Green',
      role: 'Pet Shelter Volunteer',
    },
    {
      image: 'https://images.unsplash.com/photo-1581217184298-f88b12171fb2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNhdCUyMG93bmVyfGVufDB8fDB8fHww',
      text: "Vetty makes it so easy to keep my cat healthy with all the products I need in one place.",
      name: 'Mark Thompson',
      role: 'Cat Owner',
    },
    {
      image: 'https://images.unsplash.com/photo-1601758177266-bc599de87707?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGV0JTIwb3duZXJ8ZW58MHx8MHx8fDA%3D',
      text: "Great selection of pet accessories and grooming products. Vetty never disappoints!",
      name: 'Sophia Lee',
      role: 'Pet Owner',
    },
  ];

  const petGalleryImages = [
    {
      src: 'https://media.istockphoto.com/id/1846927886/photo/animals-for-examination-and-treatment-in-the-veterinary-clinic.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZjZcB-7YxjT9BKgel6P3S3rgOpIHD9nYPkmLhqEGoI0=',
      alt: 'Pet Shelter Supplies',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1664304957188-a2f67dd1f721?q=80&w=1939&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Bird Cage',
    },
    {
      src: 'https://images.unsplash.com/photo-1605207209834-6b6d592283f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlyZCUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
      alt: 'Bird Food',
    },
    {
      src: 'https://images.unsplash.com/photo-1621101164063-ba88826cb918?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RG9nJTIwbGVhc2h8ZW58MHx8MHx8fDA%3D',
      alt: 'Dog Leash',
    }
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Vetty</h1>
      </div>
      <div className="about-content">
        <p>
          Vetty is your trusted veterinary e-commerce platform designed to bring essential pet products and services right to your doorstep. Whether you need pet food, vaccines, grooming, or other veterinary services, Vetty connects you with reliable providers to keep your pets healthy and happy.
        </p>
        <p>
          Our mission is to make veterinary care and pet supplies accessible, convenient, and affordable for pet owners everywhere. With Vetty, you can browse a wide range of products, book services, and manage your orders all in one place.
        </p>
        <p>
          We understand how important your pets are to you, and Vetty is committed to supporting you in providing the best care possible. From timely product refills to professional service appointments, Vetty is here to help you take care of your furry family members with ease.
        </p>
      </div>

      <div className="about-image">
        <img src="https://media.istockphoto.com/id/1832795616/photo/woman-veterinarian-is-with-dog-in-the-clinic.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZLTyrWL034O_pbsvHnL6fXGLp3TTaMUJhHbOiG4YD3o=" alt="About Vetty" />
      </div>

      <div className="mission-container">
        <h2>Our Mission</h2>
        <p>
          To provide a seamless and trustworthy platform that connects pet owners with quality veterinary products and services, ensuring pets receive the care they deserve. We strive to enhance the pet care experience through innovation, reliability, and customer-centric solutions.
        </p>
      </div>

      <div className="vision-container">
        <h2>Our Vision</h2>
        <p>
          To be the leading veterinary e-commerce platform recognized for improving pet health and wellbeing by making veterinary care and products easily accessible to all pet owners.
        </p>
      </div>

      <div className="testimonials-container">
        <h2>Customer Testimonials</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-image">
              <img src="https://images.unsplash.com/photo-1740081210299-b7ad76ae8d14?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNhdCUyMHBldHxlbnwwfHwwfHx8MA%3D%3D" alt="Customer 1" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text">"Vetty made it so easy to order my cat's food and schedule her grooming. The service is reliable and the products are top quality!"</p>
              <p className="testimonial-name">- Sarah Johnson</p>
              <p className="testimonial-course">Pet Owner</p>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-image">
              <img src="https://plus.unsplash.com/premium_photo-1674487959493-8894cc9473ea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmlyZHxlbnwwfHwwfHx8MA%3D%3D" alt="Customer 2" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text">"As a busy pet owner, Vetty's platform helps me keep track of all my dog's health needs in one place. Highly recommend!"</p>
              <p className="testimonial-name">- Michael Lee</p>
              <p className="testimonial-course">Pet Owner</p>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-image">
              <img src="https://media.istockphoto.com/id/585616148/photo/goldfish-in-aquarium-with-green-plants.webp?a=1&b=1&s=612x612&w=0&k=20&c=bFrXVzyvrv4YogCK_Y6ToCYDYNBolwAHYFdqnl5krP0=" alt="Customer 3" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text">"Great selection of products and excellent customer support. Vetty is my go-to for all pet care needs."</p>
              <p className="testimonial-name">- Emily Davis</p>
              <p className="testimonial-course">Pet Owner</p>
            </div>
          </div>

          {newTestimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-image">
                <img src={testimonial.image} alt={`Customer ${index + 4}`} />
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-name">- {testimonial.name}</p>
                <p className="testimonial-course">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pet-gallery-container">
        <h2>Pet Products Gallery</h2>
        <div className="pet-gallery-grid">
          {petGalleryImages.map((image, index) => (
            <div className="pet-gallery-card" key={index}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </div>

      <section className="location-section">
        <div className="location-section-inner">
          <h2>Explore Our Vetty Application</h2>
          <p>Your one-stop solution for customer support and problem-solving.</p>
        </div>
        <div className="location-grid">
          <div className="location-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.799445938978!2d37.05324267485637!3d-1.4371785985744886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f749c31395ff1%3A0x99a8f28a9b7b9c9!2sAthi%20River!5e0!3m2!1sen!2ske!4v1715275318481!5m2!1sen!2ske"
              width="100%" height="480" style={{ border: '0' }} allowFullScreen="" loading="lazy" title="Vetty Location Map"></iframe>
          </div>
          <div className="contact-info">
            <h3>Get In Touch</h3>
            <p>Email: support@ourvettyapp.com</p>
            <p>Phone: +254 745673825</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
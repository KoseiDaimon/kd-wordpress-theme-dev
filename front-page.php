<?php get_header(); ?>

<main class="l-main c-test">
  <section class="l-hero">
    <div class="l-container">
      <h1><?php the_title(); ?></h1>
      <img src="<?php echo get_asset_url('images/home/test.png'); ?>" alt="Hero Image">
      front-page.php<br>
      変更が自動で反映されることを確認
    </div>
  </section>

  <!-- other sections -->
</main>

<?php get_footer();

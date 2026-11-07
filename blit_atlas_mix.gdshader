shader_type texture_blit;
render_mode blend_disabled;

uniform sampler2D src : hint_blit_source0;
uniform sampler2D dst : hint_blit_source1;
uniform vec4 region;

void blit() {
	/* a proper Porter-Duff straight blend, not OpenGL's (which assumes premultiply) */
	vec2 sample = region.xy + region.zw * UV;
	vec4 s = texture(src, sample) * MODULATE;
	vec4 d = texture(dst, sample);
	float ao = s.a  + d.a * (1.0 - s.a);
	COLOR0 = vec4(
		(s.rgb * s.a + d.rgb * d.a * (1.0 - s.a)) / ao,
		ao
	);
}

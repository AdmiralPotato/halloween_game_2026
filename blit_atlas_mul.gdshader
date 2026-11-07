shader_type texture_blit;
render_mode blend_mul;

uniform sampler2D source_texture0 : hint_blit_source0;
uniform vec4 region;

void blit() {
	COLOR0 = texture(source_texture0, region.xy + region.zw * UV) * MODULATE;
}
